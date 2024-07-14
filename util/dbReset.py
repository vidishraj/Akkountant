import mysql.connector
from util.dbConnector import reConnectDB, getConnection
from util.logger import logging


class DBReset:
    _dbConnection: mysql.connector.connection.MySQLConnection
    _tryCount: int = 0

    def __init__(self):
        self._dbConnection = None
        self._tryCount = 0
        self.max_retries = 2

    def checkDbConnection(self):
        try:
            if self._dbConnection.is_connected():
                return True
            else:
                self._dbConnection = getConnection()
            self._dbConnection.cursor()
            self._tryCount = 0
            return True
        except Exception as ex:
            logging.info(f"Retrying connection. tryCount - {self._tryCount} -- error:{ex} ")
            self._tryCount += 1
            reConnectDB()
            self._dbConnection = getConnection()
