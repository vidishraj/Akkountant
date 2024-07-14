import mysql.connector
from mysql.connector.errors import IntegrityError

from util.queries import Queries
from util.logger import logging
from util.dbReset import DBReset


class GoldHandler(DBReset):

    def __init__(self, dbConnection):
        super().__init__()
        self._dbConnection = dbConnection

    def fetchAllGold(self):
        try:
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor(buffered=True)
            cursor.execute(Queries.fetchGoldDeposit)
            deposits = cursor.fetchall()
            refinedDeposits = []
            for deposit in deposits:
                refinedDeposits.append({
                    "depositID": deposit[0],
                    "purchaseDate": deposit[1],
                    "description": deposit[2],
                    "goldType": deposit[3],
                    "purchaseAmount": deposit[4],
                    "purchaseQuantity": deposit[5]
                })
            cursor.close()
            return refinedDeposits
        except Exception as ex:
            logging.error(f"Error while fetching gold deposits. {ex}")
            return False

    def fetchAllGoldRates(self):
        try:
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor(buffered=True)
            cursor.execute(Queries.fetchGoldRates)
            goldRate = cursor.fetchall()
            min_timestamp = min(item[0] for item in goldRate)

            # Create the desired dictionary
            result = {
                "lastUpdated": min_timestamp,
                **{item[1]: item[2] for item in goldRate}
            }

            cursor.close()
            return result
        except Exception as ex:
            logging.error(f"Error while fetching Gold rates. {ex}")
            return False

    def deleteDeposits(self, depositID):
        try:
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.deleteGoldPurchase, tuple([depositID]))
            if cursor.rowcount > 0:
                self._dbConnection.commit()
                cursor.close()
                return True
            cursor.close()
            return False
        except Exception as ex:
            logging.error(f"Error while deleting ppf deposit {ex}")
            return False

    def insertGoldPurchase(self, deposit):
        try:
            logging.info("Starting gold deposit insertion")
            insertionCount = 0
            referenceErrors = 0
            cursor = self._dbConnection.cursor()
            try:
                cursor.execute(Queries.insertGoldPurchase, deposit)
                logging.info(f"Inserted row {deposit} into gold deposit")
                insertionCount += 1
            except IntegrityError:
                referenceErrors += 1
                logging.info(f"Reference error occurred while inserting gold deposit {deposit}")
            logging.info(f"Finished gold Deposit Insertion. Inserted {insertionCount} rows.")
            self._dbConnection.commit()
            cursor.close()
            return True
        except Exception as ex:
            logging.error(f"Error while inserting gold deposit {ex}")
            return False

    def insertGoldRate(self, rateRow):
        try:
            logging.info("Starting gold rate insertion")
            insertionCount = 0
            referenceErrors = 0
            cursor = self._dbConnection.cursor()
            try:
                cursor.execute(Queries.insertGoldRate, rateRow)
                logging.info(f"Inserted row {rateRow} into gold rate")
                insertionCount += 1
            except IntegrityError:
                referenceErrors += 1
                logging.info(f"Reference error occurred while inserting gold rate {rateRow}")
                cursor.execute(Queries.updateGoldRate, tuple([rateRow[2], rateRow[0], rateRow[1]]))
                if cursor.rowcount > 0:
                    logging.info("Ran the update query instead. Successfully Updated.")
                    insertionCount += 1
                    referenceErrors -= 1
            logging.info(f"Finished gold rate Insertion. Inserted {insertionCount} rows.")
            self._dbConnection.commit()
            cursor.close()
            return True
        except Exception as ex:
            logging.error(f"Error while inserting gold rate {ex}")
            return False
