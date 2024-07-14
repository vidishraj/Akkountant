import mysql.connector
from mysql.connector.errors import IntegrityError

from util.queries import Queries
from util.logger import logging

from util.dbReset import DBReset


class PPFHandler(DBReset):
    


    def __init__(self, dbConnection):
        super().__init__()
        self._dbConnection = dbConnection

    def fetchOnlyPPFDeposit(self):
        self._dbConnection.commit()
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.fetchAllDeposits)
        ppf = cursor.fetchall()
        cursor.close()
        return ppf

    def fetchOnlyInterest(self):
        self._dbConnection.commit()
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.fetchAllPPFInterestRates)
        ppfInterest = cursor.fetchall()
        cursor.close()
        return ppfInterest

    def fetchAllDeposits(self):
        try:
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchAllDeposits)
            deposits = cursor.fetchall()
            keys = ['id', 'depositDate', 'amount']

            result_list = []

            for data in deposits:
                result = dict(zip(keys, data))
                result_list.append(result)
            cursor.close()
            return result_list
        except Exception as ex:
            logging.error(f"Error while fetching PPF deposits. {ex}")
            return False

    def fetchAllInterests(self):
        try:
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchAllPPFInterestRates)
            interestsRate = cursor.fetchall()
            keys = ['month', 'interest']

            result_list = []

            for data in interestsRate:
                result = dict(zip(keys, data))
                result_list.append(result)

            cursor.close()
            return result_list
        except Exception as ex:
            logging.error(f"Error while fetching interest rates. {ex}")
            return False

    def fetchAllFromPPFTable(self):
        try:
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchAllPPFTable)
            keys = ['month', 'amount', 'interest', 'total']
            data_list = cursor.fetchall()
            result_list = []

            for sublist in data_list:
                result = dict(zip(keys, sublist))
                result_list.append(result)
            cursor.close()

            return result_list
        except Exception as ex:
            logging.error(f"Error occurred while fetching ppf table. {ex}")
            return False

    def insertIntoPPFTable(self, ppfRows):
        try:
            self.deleteAllFromPPFTable()
            logging.info("Starting PPF insertion")
            insertionCount = 0
            referenceErrors = 0
            cursor = self._dbConnection.cursor()
            for row in ppfRows:
                try:
                    cursor.execute(Queries.insertIntoPPFTable, row)
                    logging.info(f"Inserted row {row} into ppf table")
                    insertionCount += 1
                except IntegrityError:
                    referenceErrors += 1
                    logging.info(f"Reference error occurred while inserting ppf {row}")
            logging.info(f"Finished PPF Insertion. Inserted {insertionCount} rows.")
            self._dbConnection.commit()
            return True
        except Exception as ex:
            logging.error(f"Error while inserting rows in to ppf table. {ex}")
            return False

    def deleteAllFromPPFTable(self):
        try:
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.deleteAllFromPPFTable)
            logging.info(f"{cursor.rowcount}")
            self._dbConnection.commit()
            return True
        except Exception as ex:
            logging.error(f"Error while deleting all PPF {ex}")
            return False

    def insertIntoPPFDeposit(self, deposit):
        try:
            logging.info("Starting PPF deposit insertion")
            insertionCount = 0
            referenceErrors = 0
            cursor = self._dbConnection.cursor()
            try:
                cursor.execute(Queries.insertIntoPPFDeposit, deposit)
                logging.info(f"Inserted row {deposit} into ppf deposit")
                insertionCount += 1
            except IntegrityError:
                referenceErrors += 1
                logging.info(f"Reference error occurred while inserting ppf deposit {deposit}")
            logging.info(f"Finished PPF Deposit Insertion. Inserted {insertionCount} rows.")
            self._dbConnection.commit()
            return True
        except Exception as ex:
            logging.error(f"Error while inserting ppf deposit {ex}")
            return False

    def deleteDeposits(self, depositID):
        try:
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.deletePPFDeposit, tuple([depositID]))
            if cursor.rowcount > 0:
                self._dbConnection.commit()
                return True
            return False
        except Exception as ex:
            logging.error(f"Error while deleting ppf deposit {ex}")
            return False

    def addToInterestTable(self, month, interestRate):
        try:
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.insertIntoPPFInterestTable, tuple([month, interestRate]))
            self._dbConnection.commit()
            return True
        except Exception as ex:
            logging.error(f"Error while adding ppf interest {ex}")
            return False

    def deleteFromInterestTable(self, month):
        try:
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.deleteFromPPFInterestTable, tuple([month]))
            if cursor.rowcount > 0:
                self._dbConnection.commit()
                return True
            return False
        except Exception as ex:
            logging.error(f"Error while deleting ppf interest {ex}")
            return False
