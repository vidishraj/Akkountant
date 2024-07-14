
from util.logger import logging
import mysql.connector
from mysql.connector.errors import IntegrityError
from util.queries import Queries

from util.dbReset import DBReset


class ICICITransactionHandler(DBReset):
    

    def __init__(self, dbConnection):
        super().__init__()
        self._dbConnection = dbConnection

    def deleteCreditRows(self, fileID):
        logging.info("-----Starting ICICI Credit row deletion-----")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.deleteFromICICI, tuple([fileID]))
        if cursor.rowcount > 0:
            self._dbConnection.commit()
            return True
        return False

    def fetchAllTransactions(self):
        try:
            logging.info(f"Fetching all ICICI transactions.")
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchAllICICITransactions)
            debitTransactions = []
            columns = cursor.column_names
            for x in cursor.fetchall():
                itemDict = {}
                for index, item in enumerate(x):
                    itemDict[columns[index]] = item
                debitTransactions.append(itemDict)
            cursor.close()
            logging.info("Finished fetching ICICI Transactions.")
            return debitTransactions
        except Exception as ex:
            logging.error(f"Error while fetching ICICI from db. {ex}")
            return False

    def updateLiveTable(self, transactionList: list):
        logging.info(f"Adding ICICI to live table.")
        try:
            logging.info("-----Starting live Debit Transaction Insertion-----")
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
                        logging.error(f"Error finding tag in ICICI table insertion {ex}")
                    cursor.fetchall()
                    cursor.execute(Queries.insertIntoLiveTable, transaction)
                    insertionCount += 1
                    logging.info(f"Inserted row into Live Transaction Table-{transaction}")
                except IntegrityError:
                    integrityError += 1
            self._dbConnection.commit()
            cursor.close()
            logging.info(f"Inserted {insertionCount} transactions into table. {integrityError} Integrity Errors.")
            logging.info("-----Ended Live Debit Transaction Insertion-----")
            return True
        except Exception as ex:
            logging.info(f"Error while inserting ICICI transaction into live table. {ex}")
            return False

    def updateTag(self, tag, reference):
        logging.info(f"-----Starting tag updation-----{tag} {reference}")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.updateICICITag, tuple([tag, reference]))
        if cursor.rowcount == 1:
            self._dbConnection.commit()
            return True
        return False

    def insertCreditCardStatement(self, transactionRows: list):
        insertionCount: int = 0
        integrityError: int = 0
        try:
            logging.info("Inserting statements into ICICI table.")
            cursor = self._dbConnection.cursor()
            for transaction in transactionRows:
                try:
                    try:
                        cursor.execute(Queries.findTag, tuple([transaction[2]]))
                        tagResult = cursor.fetchall()
                        if len(tagResult) > 0:
                            tag = tagResult[0][0]
                            transactionToList = list(transaction)
                            transactionToList.append(tag)
                            transaction = tuple(transactionToList)
                        else:
                            transactionToList = list(transaction)
                            transactionToList.append("")
                            transaction = tuple(transactionToList)
                    except Exception as ex:
                        logging.error(f"Error finding tag in Live table insertion {ex}")
                    cursor.fetchall()
                    cursor.execute(Queries.insertIntoICICICreditTb, transaction)
                    insertionCount += 1
                    logging.info(f"Inserted row into Debit Transaction Table-{transaction}")
                except IntegrityError:
                    integrityError += 1
                except Exception as ex:
                    logging.info(f"Error while inserting ICICI row -{transaction}--{ex}")
                    return False
            self._dbConnection.commit()
            cursor.close()
            logging.info(f"Inserted {insertionCount} transactions into table. {integrityError} Integrity Errors.")
            logging.info("-----Ended ICICI Statement Insertion and Updation-----")
            if integrityError == len(transactionRows):
                return -1
            return insertionCount
        except Exception as ex:
            logging.error(f"Error occurred while inserting ICICI statements.. - {ex}")
            return False
