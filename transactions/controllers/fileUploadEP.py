import os
from datetime import datetime

from flask import request, jsonify
from werkzeug.utils import secure_filename

from transactions.StatementFetcher.BankTypes import BankTypes
from transactions.transactionInstances import TransactionInstances
from util.logger import logging
from util.fileHelpers import deleteFileFromTemp, getFileContentLength

StatementFetcherInstance = TransactionInstances.StatementFetcherInstance

GDriveHandler = TransactionInstances.GDriveInstance
FileUploadInstance = TransactionInstances.FileUploadInstance


def resetGDriveHandler():
    global GDriveHandler
    TransactionInstances.GDriveInstance.get_authenticated_service()
    GDriveHandler = TransactionInstances.GDriveInstance


def analyseUploadedFile(filePath, fileType, GDriveID):
    transactionCount: int
    if fileType == "HDFC_Credit":
        transactionCount = TransactionInstances.HDFCCreditInstance.startParser(filePath, GDriveID)
    elif fileType == "HDFC_Debit":
        transactionCount = TransactionInstances.HDFCDebitInstance.readCSVPages(filePath, GDriveID)
    elif fileType == "ICICI":
        transactionCount = TransactionInstances.ICICIInstance.startParser(filePath, GDriveID)
    elif fileType == "HDFC_Debit_PDF":
        transactionCount = TransactionInstances.HDFCPDFCreditInstance.startParser(filePath, GDriveID)
    elif fileType == "YES_Credit":
        transactionCount = TransactionInstances.YesCreditInstance.startParser(filePath, GDriveID)
    elif fileType == "YES_Debit":
        transactionCount = TransactionInstances.YESDebitInstance.startParser(filePath, GDriveID)
    else:
        transactionCount = TransactionInstances.BOIInstance.startParser(filePath, GDriveID)
    return transactionCount


def uploadFile():
    logging.info("----File upload started----")
    fileType = request.form.get("fileType")
    filename = None
    if 'myFile' not in request.files or fileType is None:
        logging.error("Request sent with no file.")
        return jsonify({'error': 'No file part'}), 400

    file = request.files['myFile']

    if file.filename == '':
        logging.error("Request sent with no file 2.")
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filename = secure_filename(file.filename)
        directory = os.path.abspath('/tmp')
        os.makedirs(directory, exist_ok=True)
        file.save(os.path.join(directory, filename))
        file.close()
        if not GDriveHandler.checkServiceInstance():
            logging.error("Error occurred connecting to Gdrive Instance.")
            return jsonify(
                {"Auth": GDriveHandler.getAuthUrl(), "Error": f"Error occurred with GDrive Token."}), 500
        if not FileUploadInstance.checkDbConnection():
            return jsonify({"Error": f"Problem while connecting to the db."})
        GDriveId = GDriveHandler.uploadFileToDrive(filename, fileType)
        try:

            transactionCount, newFileName = analyseUploadedFile(os.path.join(directory, filename), fileType, GDriveId)

            if transactionCount == -1:
                logging.info("File already analysed before.")
                GDriveHandler.delete_file(GDriveId)
                deleteFileFromTemp(fileName=filename)
                return jsonify({'Error': 'File already uploaded'}), 401
            fileDetails = (GDriveId, datetime.now().date(), newFileName, getFileContentLength(filename), transactionCount,
                           fileType, "Uploaded to Cloud")
            if FileUploadInstance.updateAuditTable(fileDetails):
                GDriveHandler.rename_file(GDriveId, newFileName)
                logging.info("Successfully achieved all goals.")
                return jsonify({'Message': f'File uploaded successfully. {transactionCount} transactions analysed and '
                                           f'inserted into database.'}), 200
            else:
                logging.error("Error while inserting file details into the audit table.")
                raise Exception

        except Exception as ex:
            deleteFileFromTemp(filename)
            if GDriveId:
                GDriveHandler.delete_file(GDriveId)
                logging.info(f"Deleted file from drive as well. {GDriveId}")
            logging.info(f"Error occurred while saving statement in the tmpFolder. {ex}")
            if type(GDriveHandler.getServiceInstance()) == dict:
                return jsonify(
                    {"Auth": GDriveHandler.getAuthUrl(), "Error": f"Error occurred with GDrive Token. "}), 500
            return jsonify({"Error": f"Error occurred during file upload. {ex}"}), 500
        finally:
            logging.info("----File uploaded function finished-----")


def readStatements():
    try:
        logging.info("-----Starting statement parsing-----")
        postedData = request.get_json(force=True)
        dateFrom = postedData.get('dateFrom')
        dateTo = postedData.get('dateTo')
        bankType = postedData.get('bank')
        bank = None
        if bankType == "YES_Credit":
            bank = BankTypes.YES_BANK_ACE
        if bankType == "YES_Debit":
            bank = BankTypes.YES_Debit
        if bankType == "HDFC_Credit":
            bank = BankTypes.HDFC_CREDIT
        if bankType == "HDFC_Debit":
            bank = BankTypes.HDFC_DEBIT
        if bankType == "ICICI":
            bank = BankTypes.ICICI_AMAZON_PAY
        StatementFetcherInstance.startParsing(bank, dateTo, dateFrom)
        return jsonify({"Message": "Success"}), 200
    except Exception as ex:
        if ex.__str__().endswith("'Token has been expired or revoked.'})"):
            return jsonify(
                {"Auth": TransactionInstances.GmailInstance.getAuthUrl(), "Error": "Error with Gmail API"}), 500
        logging.error(f"Error occurred while reading statements from emails {ex}")
        return jsonify({"Error": ex.__str__()}), 500
    finally:
        logging.info("----Finished reading statements from email.-----")


def renameFile():
    newName = request.form.get("name")
    logging.info(f"----Starting renaming file {newName}")
    try:
        driveID = request.form.get("driveID")
        if not GDriveHandler.checkServiceInstance():
            logging.error("Error occurred connecting to Gdrive Instance.")
            return jsonify(
                {"Auth": GDriveHandler.getAuthUrl(), "Error": f"Error occurred with GDrive Token."}), 500
        if not FileUploadInstance.checkDbConnection():
            logging.error("Error occurred connection to DB or Gdrive Instance.")
            return jsonify({"Error": "DB Connection/GDrive API failed after multiple tries"}), 501
        if driveID != "null":
            if not FileUploadInstance.checkFileInCloud(driveID):
                logging.error("File doesnt exist in cloud.")
                return jsonify({"Error": "File does not exist in cloud."}), 501
            GDriveHandler.rename_file(driveID, newName)
            FileUploadInstance.renameFile(driveID, newName)
            logging.info("File renamed successfully.")
            return jsonify({'Message': "Renamed file Successfully"}), 200
    except Exception as ex:
        logging.error(f"Error while renaming files. {ex}")
        if type(GDriveHandler.getServiceInstance()) == dict:
            return jsonify(
                {"Auth": GDriveHandler.getAuthUrl(), "Error": f"Error occurred with GDrive Token."}), 500
        return jsonify({'Error': f"File renaming failed. {ex.__str__()}"}), 500
    finally:
        logging.info(f"----Finished renaming file.{newName} -----")


def deleteTransactionsByType(fileType, GDriveID):
    deletionStatus: bool
    if fileType == "HDFC_Credit":
        deletionStatus = TransactionInstances.HDFCTransactionInstance.deleteCreditRows(GDriveID)
    elif fileType == "HDFC_Debit":
        deletionStatus = TransactionInstances.HDFCTransactionInstance.deleteDebitRows(GDriveID)
    elif fileType == "ICICI":
        deletionStatus = TransactionInstances.ICICITransactionInstance.deleteCreditRows(GDriveID)
    else:
        deletionStatus = TransactionInstances.BOITransactionInstance.deleteRows(GDriveID)
    return deletionStatus


def deleteFile():
    driveId = request.form.get("driveID")
    fileType = request.form.get("fileType")
    logging.info(f"----Starting file deletion {driveId}")
    try:
        if not GDriveHandler.checkServiceInstance():
            logging.error("Error occurred connecting to Gdrive Instance.")
            return jsonify(
                {"Auth": GDriveHandler.getAuthUrl(), "Error": f"Error occurred with GDrive Token."}), 500
        if not FileUploadInstance.checkDbConnection():
            logging.error("Error occurred connection to DB or Gdrive Instance.")
        if driveId != "null":
            if not deleteTransactionsByType(fileType, driveId):
                return jsonify({'Message': "Failed to delete transactions related to table"}), 502
            if not FileUploadInstance.checkFileInCloud(driveId):
                logging.error("File doesnt exist in cloud.")
                return jsonify({"Error": "File does not exist in cloud."}), 501
            GDriveHandler.delete_file(driveId)
            FileUploadInstance.deleteFileInTable(driveId)
            logging.info("File deleted successfully and audit table updated.")
            return jsonify({'Message': "Deleted file Successfully"}), 200
    except Exception as ex:
        logging.error(f"Error while deleting file. {ex}")
        if type(GDriveHandler.getServiceInstance()) == dict:
            return jsonify(
                {"Auth": GDriveHandler.getAuthUrl(), "Error": f"Error occurred with GDrive Token."}), 500

        return jsonify({'Error': f"File deletion failed. {ex.__str__()}"}), 500
    finally:
        logging.info(f"----Finished deleting file with fileID {driveId} -----")


def downloadFile():
    logging.info("-----Starting file download.-----")
    try:
        if not GDriveHandler.checkServiceInstance():
            logging.error("Error occurred connecting to Gdrive Instance.")
            return jsonify(
                {"Auth": GDriveHandler.getAuthUrl(), "Error": f"Error occurred with GDrive Token."}), 500
        if not FileUploadInstance.checkDbConnection():
            logging.error("Error occurred connection to DB or Gdrive Instance.")
        fileID = request.form.get("fileID")
        if fileID != "null":
            return GDriveHandler.download_file(fileID)
    except Exception as ex:
        logging.error(f"Error while downloading file. {ex}")
        if type(GDriveHandler.getServiceInstance()) == dict:
            return jsonify(
                {"Auth": GDriveHandler.getAuthUrl(), "Error": f"Error occurred with GDrive Token."}), 500

        return jsonify({'Error': f"File downloading failed. {ex.__str__()}"}), 500
    finally:
        logging.info(f"----Finished file downloading.-----")


def getFileStatus():
    try:
        logging.info("----Fetching the file status.-----")
        if not FileUploadInstance.checkDbConnection():
            logging.error("Error occurred connection to DB")
            return jsonify({"Error": "DB Connection after multiple tries"}), 501
        return jsonify({"Status": TransactionInstances.FileUploadInstance.getAuditTableValues()}), 200
    except Exception as ex:
        logging.error(f"Error occurred while fetching file status. {ex}")
        return jsonify({"Error": ex.__str__()}), 500
    finally:
        logging.info(f"----Finished fetching file status.-----")
