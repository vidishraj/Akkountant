import json
from flask import request, jsonify

from transactions.controllers.fileUploadEP import resetGDriveHandler
from transactions.controllers.transactionsEP import resetGmailInstance
from transactions.transactionInstances import TransactionInstances
from util.logger import logging


def saveGmailToken():
    try:
        if TransactionInstances.GoogleHandlerInstance.checkDbConnection():

            logging.info("Saving Gmail Token")
            data = request.json

            returnValue = TransactionInstances.GoogleHandlerInstance.setGmailToken(data['access_token'], data['refresh_token'],
                                                                     data["client_id"], data["client_secret"],
                                                                     data["expires_in"])

            if returnValue:
                resetGmailInstance()
                logging.info("Saved Gmail token successfully. Handler rest successful.")
                return jsonify({"Message": "Successfully updated token"}), 200
            else:
                logging.info("Failed to update token.")
                return jsonify({"Error": "Failed to update token"})
        else:
            logging.info("Error with setting gmail token. Db problems.")
            return jsonify({"Message": "Failed to update gmail token. Db problems"}), 501

    except Exception as ex:
        logging.error(f"Error occurred while setting gmail token. {ex}")
        return jsonify({"Error": f"Error occurred while setting gmail token. {ex}"}), 500


def saveGDriveToken():
    try:
        if TransactionInstances.GoogleHandlerInstance.checkDbConnection():
            logging.info("Saving Drive Token")
            data = request.json
            TransactionInstances.GoogleHandlerInstance.setDriveToken(data['access_token'], data['refresh_token'],
                                                                     data["client_id"], data["client_secret"],
                                                                     data["expires_in"])
            resetGDriveHandler()
            logging.info("Saved drive token successfully. Handler rest successful.")
            return jsonify({"Message": "Successfully updated token"}), 200
        else:
            logging.info("Error with setting drive token. Db problems.")
            return jsonify({"Message": "Failed to update gmail token. Db problems"}), 501
    except Exception as ex:
        logging.error(f"Error occurred while setting drive token. {ex}")
        return jsonify({"Error": f"Error occurred while setting drive token. {ex}"}), 500
