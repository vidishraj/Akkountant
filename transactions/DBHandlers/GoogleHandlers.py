import mysql.connector

from util.logger import logging
from util.queries import Queries

from util.dbReset import DBReset


class GoogleHandlers(DBReset):
    __tryCount: int

    def __init__(self, dbConnection):
        super().__init__()
        self._dbConnection = dbConnection

    def getGmailToken(self):
        logging.info("Fetching Gmail token.")
        self._dbConnection.commit()
        try:
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.getGmailToken)
            token = cursor.fetchone()
            cursor.fetchall()
            cursor.close()
            tokenObject = {
                "token": token[0],
                "refresh_token": token[1],
                "client_id": token[2],
                "client_secret": token[3],
            }
            return tokenObject
        except Exception as ex:
            logging.error(f"Error while fetching Gmail token. {ex}")
            return []

    def getDriveToken(self):
        logging.info("Fetching GDrive token.")
        self._dbConnection.commit()
        try:
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.getDriveToken)
            token = cursor.fetchone()
            cursor.fetchall()
            cursor.close()
            logging.info("Fetched Drive token")
            tokenObject = {
                "token": token[0],
                "refresh_token": token[1],
                "client_id": token[2],
                "client_secret": token[3],
            }
            return tokenObject
        except Exception as ex:
            logging.error(f"Error while fetching GDrive token. {ex}")
            return []

    def setGmailToken(self, token, refresh_token, client_id, client_secret, expiry):
        logging.info("Setting Gmail Token.")
        try:
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.deleteGmailToken)
            cursor.fetchall()
            cursor.execute(Queries.insertGmailToken,
                           tuple([token, refresh_token, client_id, client_secret, expiry, "Gmail"]))
            if cursor.rowcount == 1:
                self._dbConnection.commit()
                return True
            return False
        except Exception as ex:
            logging.error(f"Error occurred while saving Gmail Token. {ex}")
            return False

    def setDriveToken(self, token, refresh_token, client_id, client_secret, expiry):
        logging.info("Setting Drive Token.")
        try:
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.deleteDriveToken)
            cursor.fetchall()
            cursor.execute(Queries.insertDriveToken,
                           tuple([token, refresh_token, client_id, client_secret, expiry, "Drive"]))
            if cursor.rowcount == 1:
                self._dbConnection.commit()
                return True
            return False
        except Exception as ex:
            logging.error(f"Error occurred while saving Drive Token. {ex}")
            return False
