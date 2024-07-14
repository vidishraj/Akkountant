import os
from datetime import datetime

from flask import request, jsonify
from werkzeug.utils import secure_filename

from transactions.controllers.transactionsEP import TransactionInstanceManager
from util.logger import logging
from util.fileHelpers import deleteFileFromTemp, getFileContentLength

GDriveHandler = TransactionInstanceManager.GDriveInstance
FileUploadInstance = TransactionInstanceManager.FileUploadInstance


def resetGDriveHandler():
    global GDriveHandler
    TransactionInstanceManager.GDriveInstance.get_authenticated_service()
    GDriveHandler = TransactionInstanceManager.GDriveInstance


def analyseUploadedFile(filePath, fileType, GDriveID):
    transactionCount: int
    if fileType == "HDFC_Credit":
        transactionCount = TransactionInstanceManager.HDFCCreditInstance.startParser(filePath, GDriveID)
    elif fileType == "HDFC_Debit":
        transactionCount = TransactionInstanceManager.HDFCDebitInstance.readCSVPages(filePath, GDriveID)
    elif fileType == "ICICI":
        transactionCount = TransactionInstanceManager.ICICIInstance.startParser(filePath, GDriveID)
    else:
        transactionCount = TransactionInstanceManager.BOIInstance.startParser(filePath, GDriveID)
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

            transactionCount = analyseUploadedFile(os.path.join(directory, filename), fileType, GDriveId)

            if transactionCount == -1:
                logging.info("File already analysed before.")
                GDriveHandler.delete_file(GDriveId)
                deleteFileFromTemp(fileName=filename)
                return jsonify({'Error': 'File already uploaded'}), 401

            fileDetails = (GDriveId, datetime.now().date(), filename, getFileContentLength(filename), transactionCount,
                           fileType, "Uploaded to Cloud")
            if FileUploadInstance.updateAuditTable(fileDetails):
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
        deletionStatus = TransactionInstanceManager.HDFCTransactionInstance.deleteCreditRows(GDriveID)
    elif fileType == "HDFC_Debit":
        deletionStatus = TransactionInstanceManager.HDFCTransactionInstance.deleteDebitRows(GDriveID)
    elif fileType == "ICICI":
        deletionStatus = TransactionInstanceManager.ICICITransactionInstance.deleteCreditRows(GDriveID)
    else:
        deletionStatus = TransactionInstanceManager.BOITransactionInstance.deleteRows(GDriveID)
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
        return jsonify({"Status": TransactionInstanceManager.FileUploadInstance.getAuditTableValues()}), 200
    except Exception as ex:
        logging.error(f"Error occurred while fetching file status. {ex}")
        return jsonify({"Error": ex.__str__()}), 500
    finally:
        logging.info(f"----Finished fetching file status.-----")
