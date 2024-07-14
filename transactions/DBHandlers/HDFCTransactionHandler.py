import mysql.connector
from mysql.connector.errors import IntegrityError


from util.logger import logging
from util.queries import Queries

from util.dbReset import DBReset

class HDFCTransactionHandler(DBReset):
    


    def __init__(self, dbConnection):
        super().__init__()
        self._dbConnection = dbConnection


    def fetchAllTransactions(self):
        try:
            logging.info(f"Fetching all HDFC transactions.")
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchAllHDFCDebitTransactions)
            debitTransactions = []
            creditTransactions = []
            columns = cursor.column_names
            for x in cursor.fetchall():
                itemDict = {}
                for index, item in enumerate(x):
                    itemDict[columns[index]] = item
                debitTransactions.append(itemDict)
            cursor.execute(Queries.fetchAllHDFCCreditTransactions)
            columns = cursor.column_names
            for x in cursor.fetchall():
                itemDict = {}
                for index, item in enumerate(x):
                    itemDict[columns[index]] = item
                creditTransactions.append(itemDict)
            cursor.close()
            logging.info("Finished fetching HDFC Transactions.")
            return debitTransactions, creditTransactions
        except Exception as ex:
            logging.error(f"Error while fetching transactions from db. {ex}")
            return False

    def updateLiveTable(self, transactionList: list):
        logging.info(f"Adding to live table.")
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
                            transactionToList = [item for item in transaction]
                            transactionToList[3] = tag
                            transaction = tuple(transactionToList)
                    except Exception as ex:
                        logging.error(f"Error finding tag in HDFC table insertion {ex}")
                    cursor.fetchall()
                    cursor.execute(Queries.insertIntoLiveTable, tuple(transaction))
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
            logging.info(f"Error while inserting HDFC transaction into live table. {ex}")
            return False

    def updateTag(self, bank, tag, reference):
        logging.info("-----Starting tag updation-----")
        cursor = self._dbConnection.cursor()
        if "Credit" in bank:
            cursor.execute(Queries.updateHDFCCreditTag, tuple([tag, reference['date'], reference['details'],
                                                               reference['amount']]))
            if cursor.rowcount == 1:
                self._dbConnection.commit()
                return True
        elif "Debit" in bank:
            cursor.execute(Queries.updateHDFCDebitTag, tuple([tag, reference['reference']]))
            if cursor.rowcount == 1:
                self._dbConnection.commit()
                return True
        return False

    def updateCreditForLive(self, credit, reference):
        logging.info("-----Starting credit updation for live table-----")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.updateCreditInfoInLiveTable,
                       tuple([credit, reference['date'], reference['details'], reference['amount']]))
        if cursor.rowcount == 1:
            self._dbConnection.commit()
            return True
        return False

    def updateLiveTag(self, tag, reference):
        logging.info("Starting live table tag updation")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.updateLiveTableTag,
                       tuple([tag, reference['date'], reference['details'], reference['amount']]))
        if cursor.rowcount == 1:
            self._dbConnection.commit()
            return True
        return False

    def deleteDebitRows(self, fileID):
        logging.info("-----Starting HDFC Debit row deletion-----")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.deleteFromHDFCDebit, tuple([fileID]))
        if cursor.rowcount > 0:
            self._dbConnection.commit()
            return True
        return False

    def deleteCreditRows(self, fileID):
        logging.info("-----Starting HDFC Credit row deletion-----")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.deleteFromHDFCCredit, tuple([fileID]))
        if cursor.rowcount > 0:
            self._dbConnection.commit()
            return True
        return False

    def insertDebitCardStatementTransactions(self, transactionList):
        try:
            logging.info("-----Starting transaction comparison and insertion from statement-----")
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
                        logging.error(f"Error finding tag in Live table insertion {ex}")
                    cursor.fetchall()
                    cursor.execute(Queries.insertIntoHDFCDebitTb, transaction)
                    insertionCount += 1
                    logging.info(f"Inserted row into Debit Transaction Table-{transaction}")
                except IntegrityError:
                    integrityError += 1
                    logging.info(f"Reference error occurred while inserting credit {transaction}")
            self._dbConnection.commit()
            cursor.close()
            if integrityError == len(transactionList):
                return -1
            logging.info(f"Inserted {insertionCount} transactions into table. {integrityError} Integrity Errors.")
            logging.info("-----Ended Debit Statement Insertion and Updation-----")
            return insertionCount
        except Exception as ex:
            logging.error(f"Error while inserting transactions from statement to db. {ex}")

    def insertCreditCardStatementTransactions(self, transactionList:list[tuple]):
        try:
            logging.info(f" ----Inserting {len(transactionList)} credit card transactions read from the statement----")
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
                            transactionToList.append(tag)
                            transaction = tuple(transactionToList)
                        else:
                            transactionToList = list(transaction)
                            transactionToList.append("")
                            transaction = tuple(transactionToList)
                    except Exception as ex:
                        logging.error(f"Error finding tag in Live table insertion {ex}")
                    cursor.fetchall()
                    cursor.execute(Queries.insertIntoHDFCCreditTb, transaction)
                    insertedTransactions += 1
                    logging.info(f"Inserted credit card transaction into db {transaction}")
                except IntegrityError:
                    referenceErrors += 1
                    logging.info(f"Reference error occurred while inserting credit {transaction}")
            self._dbConnection.commit()
            if referenceErrors == len(transactionList):
                return -1
            return insertedTransactions
        except Exception as ex:
            logging.error(f"Exception occurred while inserting credit card transactions {ex}")
            return 0
