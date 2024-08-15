import base64
import os
from datetime import datetime
from urllib.parse import urlparse, parse_qs

import requests
from bs4 import BeautifulSoup
from werkzeug.utils import secure_filename

from transactions.DBHandlers.fileUploadHandler import FileUploadHandler
from transactions.GDriveUploader.GDriveUpload import GDriveUpload
from transactions.GmailAPI.gmailConnector import GmailApi
from transactions.StatementFetcher.BankTypes import BankTypes

from util.fileHelpers import deleteFileFromTemp, getFileContentLength
from util.logger import logging


class StatementFetcher:
    gmailInstance: GmailApi
    serviceInstance: FileUploadHandler
    driveInstance: GDriveUpload

    def __init__(self, gmailInstance: GmailApi, driveInstance, fileUploadInstance: FileUploadHandler):
        self.gmailInstance = gmailInstance
        self.serviceInstance = fileUploadInstance
        self.driveInstance = driveInstance

    def checkDBConnection(self):
        return self.serviceInstance.checkDbConnection()

    def checkGmailConnection(self):
        return self.gmailInstance.checkServiceInstance()

    def checkDriveConnection(self):
        return self.driveInstance.checkServiceInstance()

    def downloadToTemp(self, bankType: BankTypes, dateTo, dateFrom):
        serviceInstance = self.gmailInstance.getServiceInstance()
        searchString = bankType.searchString
        if bankType.bank == "YES_Debit":
            # Custom case to manage YES bank debit statements
            results = serviceInstance.users().messages().list(userId='me', q=f"subject:({searchString}) -ACE " +
                                                                             f"after:{dateFrom} before:{dateTo}").execute()
        else:
            results = serviceInstance.users().messages().list(userId='me', q=searchString +
                                                                             f"after:{dateFrom} before:{dateTo}").execute()
        emails = results.get('messages', [])
        logging.info(f"Found {len(emails)} statements in the range")
        files = []
        for index, message in enumerate(emails):
            msg = serviceInstance.users().messages().get(userId='me', id=message['id']).execute()
            for part in msg['payload'].get('parts', []):
                if part['filename']:
                    if 'data' in part['body']:
                        data = part['body']['data']
                    else:
                        att_id = part['body']['attachmentId']
                        att = serviceInstance.users().messages().attachments().get(userId='me',
                                                                                   messageId=message['id'],
                                                                                   id=att_id).execute()
                        data = att['data']
                    ext = part['filename'].split('.')[-1]
                    file_data = base64.urlsafe_b64decode(data.encode('UTF-8'))
                    filename = secure_filename(f"file-{index}.{ext}")
                    directory = os.path.abspath('/tmp')
                    os.makedirs(directory, exist_ok=True)

                    with open(os.path.join(directory, filename), 'wb') as f:
                        f.write(file_data)
                    logging.info(f'Attachment {filename} downloaded.')
                    files.append(filename)
        return files

    def downloadPDFFromSmartStatement(self, searchString, dateTo, dateFrom):
        serviceInstance = self.gmailInstance.getServiceInstance()
        results = serviceInstance.users().messages().list(
            userId='me', q=searchString + f"after:{dateFrom} before:{dateTo}"
        ).execute()
        emails = results.get('messages', [])
        logging.info(f"Found {len(emails)} statements in the range")
        href = []
        if not emails:
            return None
        for index, email in enumerate(emails):
            msg_id = email['id']
            message = serviceInstance.users().messages().get(userId='me', id=msg_id).execute()
            logging.info(f"Checking mail {index + 1}")

            try:
                parts = message['payload']['parts']
                while parts:
                    if parts:
                        for part in parts:
                            try:
                                data = part['body']['data']
                                decoded_data = base64.urlsafe_b64decode(data).decode('utf-8')
                                soup = BeautifulSoup(decoded_data, 'html.parser')
                                td_tag = soup.find('td',
                                                   style="background-color: #004b8d; padding: 12px; font-size: 14px; "
                                                         "letter-spacing: 1px; border-radius: 5px;")
                                if td_tag:
                                    a_tag = td_tag.find('a')
                                    if a_tag and 'href' in a_tag.attrs:
                                        href.append(a_tag['href'])

                            except:
                                continue
                    parts = parts[0]['parts']
            except:
                continue
        logging.info(f"Extracted {len(href)} href from mails")
        return href

    def downloadFileFromHrefs(self, hrefs: list):
        jobReqList = []
        for link in hrefs:
            item = []
            parsed_url = urlparse(link)
            query_params = parse_qs(parsed_url.query)
            jobKey = query_params.get('jobkey', [None])[0]
            response = requests.get(link, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                                                                 "AppleWebKit/537.36 (KHTML, like Gecko) "
                                                                 "Chrome/126.0.0.0 Safari/537.36"})
            html_content = response.text
            soup = BeautifulSoup(html_content, 'html.parser')
            value = None
            input_element = soup.find('input', {'type': 'hidden', 'name': 'seqence', 'id': 'seqence'})
            if input_element and 'value' in input_element.attrs:
                value = input_element['value']
            if value and jobKey:
                item.append(value)
                item.append(jobKey)
                jobReqList.append(item)
        return self.downloadHDFCStatements(jobReqList)

    @staticmethod
    def downloadHDFCStatements(jobReqList):
        downloaded_files = []

        for item in jobReqList:
            jobKey = item[1]
            reqId = item[0]
            templateDownloadLink = f"https://smartstatements.hdfcbank.com/HDFCRestFulService/webresources/app/pdfformat" \
                                   f"?jobkey={jobKey}&reqid={reqId}&format=pdf"
            response = requests.post(templateDownloadLink,
                                     headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                                                            "AppleWebKit/537.36 (KHTML, like Gecko) "
                                                            "Chrome/126.0.0.0 Safari/537.36"})

            if response.status_code == 200:
                # Define the file name and path
                filename = f"HDFC_Statement_{jobKey}_{reqId}.pdf"

                directory = os.path.abspath('/tmp')
                file_path = os.path.join(directory, filename)

                # Save the PDF file
                with open(file_path, 'wb') as pdf_file:
                    pdf_file.write(response.content)

                downloaded_files.append(filename)
            else:
                logging.error(response.content)
                logging.error(templateDownloadLink)
                logging.error(
                    f"Failed to download statement for jobkey {jobKey} and reqId {reqId}. HTTP Status: {response.status_code}")

        logging.info(f"Successfully downloaded {len(downloaded_files)} files")
        return downloaded_files

    def startParsing(self, bankDetails: BankTypes, dateTo: str, dateFrom: str):
        logging.info("-----Reading Statements from Mail.------")
        try:

            from transactions.controllers.fileUploadEP import analyseUploadedFile
            if not self.checkGmailConnection():
                logging.error("No connection to gmail")
                return
            if not self.checkDriveConnection():
                logging.error("No connection to gdrive")
                return
            if not self.checkDBConnection():
                logging.error("No connection to database")
                return
            directory = os.path.abspath('/tmp')
            if bankDetails.bank == "HDFC_Debit_PDF":
                hrefs = self.downloadPDFFromSmartStatement(bankDetails.searchString, dateTo, dateFrom)
                files = self.downloadFileFromHrefs(hrefs)
            else:
                files = self.downloadToTemp(bankDetails, dateTo, dateFrom)
            for file in files:
                logging.info(f"Uploading {file} to google drive")
                GDriveId = None
                try:
                    GDriveId = self.driveInstance.uploadFileToDrive(file, bankDetails.bank)
                    transactionCount, newFileName = analyseUploadedFile(os.path.join(directory, file), bankDetails.bank,
                                                           GDriveId)

                    if transactionCount == -1:
                        logging.info("File already analysed before.")
                        self.driveInstance.delete_file(GDriveId)
                        deleteFileFromTemp(fileName=file)
                        logging.warning('File already uploaded')
                    else:
                        fileDetails = (
                            GDriveId, datetime.now().date(), newFileName, getFileContentLength(file), transactionCount,
                            bankDetails.bank, "Uploaded to Cloud")
                        if self.serviceInstance.updateAuditTable(fileDetails):
                            self.driveInstance.rename_file(GDriveId, newFileName)
                            logging.info(
                                {'Message': f'File uploaded successfully. {transactionCount} transactions analysed and '
                                            f'inserted into database.'}), 200
                        else:
                            logging.error("Error while inserting file details into the audit table.")
                            raise Exception

                except Exception as ex:
                    deleteFileFromTemp(file)
                    if GDriveId:
                        self.driveInstance.delete_file(GDriveId)
                        logging.error(f"Deleted file from drive. {GDriveId}")
                    logging.error(f"Error occurred. Deleted files from temp as well. {ex}")
                    continue

            return
        except Exception as ex:
            logging.error(f"Error while reading statements from mail.{ex}")
        finally:
            logging.info("-----Finished reading statements from mail.-----")
