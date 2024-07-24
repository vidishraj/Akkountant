from mysql.connector.errors import IntegrityError

from util.logger import logging
from util.queries import Queries

from util.dbReset import DBReset


class YESTransactionHandler(DBReset):

    def __init__(self, dbConnection):
        super().__init__()
        self._dbConnection = dbConnection

    def updateLiveTable(self, transactionList: list):
        logging.info(f"Adding to live table.")
        try:
            logging.info("-----Starting live YES Bank Transaction Insertion-----")
            cursor = self._dbConnection.cursor()
            insertionCount: int = 0
            integrityError: int = 0
            for transaction in transactionList:
                try:
                    try:
                        cursor.execute(Queries.findTag, tuple([transaction[1]]))
                        tagResult = cursor.fetchall()
                        if len(tagResult) > 0:
                            tag = tagResult[0][0]
                            transactionToList = list(transaction)
                            transactionToList[3] = tag
                            transaction = tuple(transactionToList)
                    except Exception as ex:
                        logging.error(f"Error finding tag in YES bank table insertion {ex}")
                    cursor.fetchall()
                    cursor.execute(Queries.insertIntoLiveTable, transaction)
                    insertionCount += 1
                    logging.info(f"Inserted row into Live Transaction Table YES Bank-{transaction}")
                except IntegrityError:
                    integrityError += 1
            self._dbConnection.commit()
            cursor.close()
            logging.info(f"Inserted {insertionCount} transactions into table. {integrityError} Integrity Errors.")
            logging.info("-----Ended Live Debit Transaction Insertion-----")
            return True
        except Exception as ex:
            logging.info(f"Error while inserting YES Bank transaction into live table. {ex}")
            return False

    def insertCreditCardStatementTransactions(self, transactionList):
        try:
            logging.info("-----Started Insertion for Yes bank Credit Statements-----")
            cursor = self._dbConnection.cursor()
            insertionCount: int = 0
            integrityError: int = 0
            for transaction in transactionList:
                try:
                    try:
                        cursor.execute(Queries.findTag, tuple([transaction[1]]))
                        tagResult = cursor.fetchall()
                        if len(tagResult) > 0:
                            tag = tagResult[0][0]
                            transactionToList = list(transaction)
                            transactionToList[4] = tag
                            transaction = tuple(transactionToList)
                    except Exception as ex:
                        logging.error(f"Error finding tag in YES Credit Statement insertion {ex}")
                    cursor.fetchall()
                    cursor.execute(Queries.insertIntoYESCreditTb, transaction)
                    insertionCount += 1
                    logging.info(f"Inserted row into YES Credit Transaction Table-{transaction}")
                except IntegrityError:
                    integrityError += 1
                    logging.info(f"Reference error occurred while inserting credit {transaction}")
            self._dbConnection.commit()
            cursor.close()
            if integrityError == len(transactionList):
                return -1
            logging.info(f"Inserted {insertionCount} transactions into table. {integrityError} Integrity Errors.")
            logging.info("-----Ended YES Credit Statement Insertion and Updation-----")
            return insertionCount
        except Exception as ex:
            logging.error(f"Error while inserting YES Credit transactions from statement to db. {ex}")

    def insertDebitCardStatementTransactions(self, transactionList: list[tuple]):
        try:
            logging.info(f" ----Started Insertion for Yes bank Debit Statements----")
            cursor = self._dbConnection.cursor()
            insertedTransactions = 0
            referenceErrors = 0
            for transaction in transactionList:
                try:
                    try:
                        cursor.execute(Queries.findTag, tuple([transaction[1]]))
                        tagResult = cursor.fetchall()
                        if len(tagResult) > 0:
                            tag = tagResult[0][0]
                            transactionToList = list(transaction)
                            transactionToList[4] = tag
                            transaction = tuple(transactionToList)
                    except Exception as ex:
                        logging.error(f"Error finding tag in Yes bank Debit insertion {ex}")
                    cursor.fetchall()
                    cursor.execute(Queries.insertIntoYESDebitTb, transaction)
                    insertedTransactions += 1
                    logging.info(f"Inserted Yes bank Debit transaction into db {transaction}")
                except IntegrityError:
                    referenceErrors += 1
                    logging.info(f"Reference error occurred while inserting Yes bank Debit {transaction}")
            self._dbConnection.commit()
            if referenceErrors == len(transactionList):
                return -1
            return insertedTransactions
        except Exception as ex:
            logging.error(f"Exception occurred while inserting Yes bank Debit transactions {ex}")
            return 0

    def fetchAllDebit(self):
        try:
            logging.info(f"Fetching all YES Bank Debit.")
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchAllYesBankDebit)
            debitTransactions = []
            columns = cursor.column_names
            for x in cursor.fetchall():
                itemDict = {}
                for index, item in enumerate(x):
                    itemDict[columns[index]] = item
                debitTransactions.append(itemDict)

            cursor.close()
            logging.info("Finished fetching Yes Bank Transactions.")
            return debitTransactions
        except Exception as ex:
            logging.error(f"Error while fetching Yes Bank Debit transactions from db. {ex}")
            return False

    def fetchAllCredit(self):
        try:
            logging.info(f"Fetching all Yes Bank Credit transactions.")
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchAllYesBankCredit)
            debitTransactions = []
            columns = cursor.column_names
            for x in cursor.fetchall():
                itemDict = {}
                for index, item in enumerate(x):
                    itemDict[columns[index]] = item
                debitTransactions.append(itemDict)

            cursor.close()
            logging.info("Finished fetching Yes Bank Credit Transactions.")
            return debitTransactions
        except Exception as ex:
            logging.error(f"Error while fetching Yes Bank Credit Transactions from db. {ex}")
            return False

    def deleteDebitRows(self, fileID):
        logging.info("-----Starting YES Debit row deletion-----")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.deleteFromYESDebit, tuple([fileID]))
        if cursor.rowcount > 0:
            self._dbConnection.commit()
            return True
        return False

    def deleteCreditRows(self, fileID):
        logging.info("-----Starting YES Credit row deletion-----")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.deleteFromYESCredit, tuple([fileID]))
        if cursor.rowcount > 0:
            self._dbConnection.commit()
            return True
        return False
