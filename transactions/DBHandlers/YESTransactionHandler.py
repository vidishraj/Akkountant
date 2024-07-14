
import mysql.connector
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
