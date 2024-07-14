from util.logger import logging
from util.queries import Queries

from util.dbReset import DBReset


def logTagging(rowCount, tableName):
    if rowCount > 0:
        logging.info(f"{rowCount} updated with tags in {tableName}")
        return True
    else:
        logging.error(f"No rows updated in {tableName}")
        return False


class LiveTableHandler(DBReset):
    __tryCount: int = 0

    def __init__(self, connection):
        super().__init__()
        self._dbConnection = connection

    def deleteAllFromLiveTable(self):
        logging.info("-----Deleting all transactions from live table-----")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.deleteAllInLiveTable)
        cursor.close()
        self._dbConnection.commit()
        return True

    def fetchLiveTable(self):
        self._dbConnection.commit()
        logging.info("-----Fetching transactions from live table-----")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.fetchFromLiveTable)
        transactions = cursor.fetchall()
        cursor.fetchall()
        responseObject = []
        for transaction in transactions:
            responseObject.append({
                "date": transaction[0],
                "details": transaction[1],
                "amount": transaction[2],
                "tag": transaction[3],
                "bank": transaction[4],
                "credit": transaction[5]
            })
        cursor.close()
        return responseObject

    def addAutoTag(self, details, tag):
        cursor = self._dbConnection.cursor()
        insertionCheck = True
        cursor.execute(Queries.insertTagIntoAutoTag, tuple([details, tag]))
        insertionCheck &= logTagging(cursor.rowcount, "AutoTag")
        cursor.execute(Queries.updateLiveTableAfterAutoTag, tuple([tag, details]))
        insertionCheck &= logTagging(cursor.rowcount, "Live Table")
        cursor.execute(Queries.updateHDFCCreditAfterAutoTag, tuple([tag, details]))
        insertionCheck &= logTagging(cursor.rowcount, "HDFC Credit")
        cursor.execute(Queries.updateHDFCDebitAfterAutoTag, tuple([tag, details]))
        insertionCheck &= logTagging(cursor.rowcount, "HDFC Debit")
        cursor.execute(Queries.updateICICIAfterAutoTag, tuple([tag, details]))
        insertionCheck &= logTagging(cursor.rowcount, "ICICI")
        cursor.execute(Queries.updateBOIAfterAutoTag, tuple([tag, details]))
        insertionCheck &= logTagging(cursor.rowcount, "BOI")
        self._dbConnection.commit()
