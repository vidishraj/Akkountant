from io import BytesIO

from flask import send_file
from google.auth.exceptions import RefreshError
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
import os.path

from transactions.DBHandlers.GoogleHandlers import GoogleHandlers
from util.dbConnector import Config
from util.logger import logging


class GDriveUpload:
    # Define the scopes required for Google Drive API
    SCOPES = ['https://www.googleapis.com/auth/drive.file']
    tempFolderPath: str = os.path.abspath('/tmp')
    __AuthUrl: str = ""
    config = None
    __ServiceInstance: build
    GoogleHandler: GoogleHandlers

    def __init__(self, googleInstance):
        self.config = Config
        self.__ServiceInstance = None
        self.GoogleHandler = googleInstance
        self.get_authenticated_service()

    def checkServiceInstance(self):
        tryCounts = 0
        while self.__ServiceInstance is None:
            self.get_authenticated_service()
            tryCounts += 1
            if tryCounts == 5:
                logging.error("Failed to get GDrive Instance.")
                return False
        return True

    def get_authenticated_service(self):
        flowConfig = {
            "web": self.config['google']
        }
        flow = InstalledAppFlow.from_client_config(client_config=flowConfig,
                                                   scopes=self.SCOPES)
        try:
            logging.info("-----Starting GDrive Service Instantiation-----")
            creds = Credentials.from_authorized_user_info(info=self.GoogleHandler.getDriveToken(), scopes=self.SCOPES)
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                    self.__AuthUrl = flow.client_config
                else:
                    self.__AuthUrl = flow.client_config
                    raise Exception("Credentials failed")
            self.__ServiceInstance = build('drive', 'v3', credentials=creds)
            logging.info("-----GDrive Connection Established.-----")
        except RefreshError as ex:
            logging.error(f"Error occurred with token.json. Please try again. -{ex}")
            flow = InstalledAppFlow.from_client_config(flowConfig, self.SCOPES)
            self.__AuthUrl = flow.client_config
            return
        except Exception as ex:
            self.__AuthUrl = flow.client_config
            logging.error(f"Error while getting GDrive token. {ex}")
            return ex

    def getServiceInstance(self):
        try:
            return self.__ServiceInstance
        except:
            return self.__AuthUrl

    def getAuthUrl(self):
        return self.__AuthUrl

    def download_file(self, file_id):
        if self.__ServiceInstance is None:
            self.get_authenticated_service()
        driveService = self.__ServiceInstance
        file_metadata = driveService.files().get(fileId=file_id).execute()
        request = driveService.files().get_media(fileId=file_id)
        file_content = request.execute()

        return send_file(
            BytesIO(file_content),
            as_attachment=True,
            download_name=file_metadata['name']
        )

    def rename_file(self, file_id, new_name):
        if self.__ServiceInstance is None:
            self.get_authenticated_service()
        driveService = self.__ServiceInstance
        file = driveService.files().get(fileId=file_id).execute()
        file['name'] = new_name
        updated_file = driveService.files().update(fileId=file_id, body={'name': new_name}).execute()

    def delete_file(self, file_id):
        if self.__ServiceInstance is None:
            self.get_authenticated_service()
        driveService = self.__ServiceInstance
        driveService.files().delete(fileId=file_id).execute()
        logging.info(f"File with ID {file_id} has been deleted.")

    def uploadFileToDrive(self, fileName: str, parentFolder: str):
        if self.__ServiceInstance is None:
            self.get_authenticated_service()
        drive_service = self.__ServiceInstance
        file_metadata = {'name': f'{fileName}', 'parents': [self.config[parentFolder]]}
        media = MediaFileUpload(os.path.join(self.tempFolderPath, fileName), mimetype='text/plain')
        uploaded_file = drive_service.files().create(body=file_metadata, media_body=media).execute()

        logging.info(f'Uploaded file to Drive with File ID: {uploaded_file["id"], uploaded_file}')
        return uploaded_file["id"]
