import mysql.connector
from mysql.connector.errors import IntegrityError

from util.queries import Queries
from util.logger import logging
from util.dbReset import DBReset


class FDHandler(DBReset):
    

    def __init__(self, dbConnection):
        super().__init__()
        self._dbConnection = dbConnection

    def fetchAllFDDeposits(self):
        try:
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchAllFDDeposits)
            deposits = cursor.fetchall()
            keys = ['depositID', 'investmentDate', 'investedAmount', 'interestRate', 'compoundTenure',
                    'investmentDuration', 'investmentBank', 'maturityAmount']
            result = []
            for deposit in deposits:
                result.append({keys[i]: value for i, value in enumerate(deposit)})
            cursor.close()
            return result
        except Exception as ex:
            logging.error(f"Error while fetching FD deposits. {ex}")
            return False

    def insertIntoFDDeposit(self, deposit):
        try:
            logging.info("Starting FD deposit insertion")
            insertionCount = 0
            referenceErrors = 0
            cursor = self._dbConnection.cursor()
            try:
                cursor.execute(Queries.insertFDDeposit, deposit)
                logging.info(f"Inserted row {deposit} into fd deposit")
                insertionCount += 1
            except IntegrityError:
                referenceErrors += 1
                logging.info(f"Reference error occurred while inserting fd deposit {deposit}")
            logging.info(f"Finished fd Deposit Insertion. Inserted {insertionCount} rows.")
            self._dbConnection.commit()
            return True
        except Exception as ex:
            logging.error(f"{ex}")
            return False

    def deleteDeposits(self, depositID):
        try:
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.deleteFDDeposit, tuple([depositID]))
            if cursor.rowcount > 0:
                self._dbConnection.commit()
                return True
            return False
        except Exception as ex:
            logging.error(f" Error while deleting fd deposit {ex}")
            return False
