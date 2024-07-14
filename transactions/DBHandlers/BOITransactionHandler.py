from util.logger import logging
import mysql.connector
from mysql.connector.errors import IntegrityError
from util.queries import Queries
from util.dbReset import DBReset


class BOITransactionHandler(DBReset):
    
    __tryCount: int = 0

    def __init__(self, dbConnection):
        super().__init__()
        self._dbConnection = dbConnection

    def fetchAllTransactions(self):
        try:
            logging.info(f"Fetching all BOI transactions.")
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchAllBOITransactions)
            debitTransactions = []
            columns = cursor.column_names
            for x in cursor.fetchall():
                itemDict = {}
                for index, item in enumerate(x):
                    itemDict[columns[index]] = item
                debitTransactions.append(itemDict)

            cursor.close()
            logging.info("Finished fetching BOI Transactions.")
            return debitTransactions
        except Exception as ex:
            logging.error(f"Error while fetching BOI from db. {ex}")
            return False

    def updateLiveTable(self, row: tuple):
        logging.info(f"Adding to live table.")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.insertIntoLiveTable, row)
        if cursor.rowcount == 1:
            self._dbConnection.commit()
            return True
        return False

    def updateTag(self, tag, reference):
        logging.info(f"-----Starting tag updation----- {tag} {reference}")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.updateBOITag,
                       tuple([reference['newTag'], reference['date'], reference['details'], reference['amount'],
                              reference['balance']]))
        if cursor.rowcount == 1:
            self._dbConnection.commit()
            return True
        return False

    def deleteRows(self, fileID):
        logging.info("-----Starting BOI row deletion-----")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.deleteFromBOI, tuple([fileID]))
        if cursor.rowcount > 0:
            self._dbConnection.commit()
            return True
        return False

    def insertDebitCardStatement(self, transactionRows: list):
        try:
            logging.info("Inserting statements into BOI table.")
            cursor = self._dbConnection.cursor()
            insertionCount: int = 0
            integrityError: int = 0
            for transaction in transactionRows:
                try:
                    try:
                        cursor.execute(Queries.findTag, tuple([transaction[1]]))
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
                        logging.error(f"Error finding tag in BOI table insertion {ex}")
                    cursor.fetchall()
                    cursor.execute(Queries.insertIntoBOITable, transaction)
                    insertionCount += 1
                    logging.info(f"Inserted row into BOI Transaction Table-{transaction}")
                except IntegrityError:
                    integrityError += 1
                    logging.info(f"Updated row with tag -{transaction}")
                except Exception as ex:
                    logging.info(f"error while inserting BOI row -{transaction}--{ex}")
                    return False

            self._dbConnection.commit()
            cursor.close()
            logging.info(f"Inserted {insertionCount} transactions into table. {integrityError} Integrity Errors.")
            logging.info("-----Ended BOI Statement Insertion and Updation-----")
            if integrityError == len(transactionRows):
                return -1
            return insertionCount
        except Exception as ex:
            logging.error(f"Error occurred while inserting BOI statements.. - {ex}")
            return False
