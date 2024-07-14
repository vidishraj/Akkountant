import datetime

from mysql.connector.errors import IntegrityError

from util.queries import Queries
from util.logger import logging
from util.dbReset import DBReset


class MutualFundsHandler(DBReset):

    def __init__(self, dbConnection):
        super().__init__()
        self._dbConnection = dbConnection

    def fetchOnlyMfTable(self):
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.fetchOnlyMfTable)
        mf = cursor.fetchall()
        cursor.close()
        return mf

    def fetchAllMutualFunds(self):
        try:
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchMutualFunds)
            MF = cursor.fetchall()
            response = []
            for deposit in MF:
                response.append({
                    "schemeCode": deposit[0],
                    "schemeName": deposit[1],
                    "fundHouse": deposit[6],
                    "latestNav": deposit[10],
                    "lastUpdated": deposit[11],
                    "quantity": deposit[3],
                    "NAV": deposit[2],
                    "investedAmount": deposit[4],
                    "schemeType": deposit[7],
                    "schemeStartDate": deposit[8],
                    'schemeStartNav': deposit[9]

                })
            cursor.close()
            return response
        except Exception as ex:
            logging.error(f"Error while fetching mutual funds. {ex}")
            return False

    def fetchMfTransactions(self):
        try:
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchMutualFundsTransactions)
            MF = cursor.fetchall()
            cursor.close()
            result_dict = {}

            for item in MF:
                id, code, name, amount, quantity, gains, transactionDate = item
                transaction_type = "BUY" if gains == 0.0 else "SELL"

                if code not in result_dict:
                    result_dict[code] = []

                result_dict[code].append({
                    "date": transactionDate,
                    "amount": amount,
                    "quantity": quantity,
                    "type": transaction_type,
                    "gains": gains
                })

            return result_dict
        except Exception as ex:
            logging.error(f"Error while fetching mutual funds. {ex}")
            return False

    def insertMutualFund(self, mutualFundData, purchaseDate):
        try:
            logging.info("Starting mutual fund insertion")
            insertionCount = 0
            referenceErrors = 0
            cursor = self._dbConnection.cursor()
            try:
                cursor.execute(Queries.addMutualFund, mutualFundData)
                logging.info(f"Inserted row {mutualFundData} into mutual fund table")
                cursor.execute(Queries.insertMutualFundInMFTransactions, tuple([mutualFundData[0],
                                                                                mutualFundData[1], mutualFundData[2],
                                                                                mutualFundData[3], 0, purchaseDate]))
                logging.info(f"Inserted row {mutualFundData} into mutual fund transaction table")
                insertionCount += 1
            except IntegrityError:
                referenceErrors += 1
                logging.info(f"Reference error occurred while inserting mutual fund {mutualFundData}")
            logging.info(f"Finished mutual fund insertion. Inserted {insertionCount} rows.")
            self._dbConnection.commit()
            return True
        except Exception as ex:
            logging.error(f"Error while inserting mutual fund {ex}")
            return False

    def sellMutualFund(self, soldQuant, schemeName, soldNav, schemeCode, boughtNav, boughtQuant, sellDate):
        try:
            cursor = self._dbConnection.cursor()
            newQuant = boughtQuant - soldQuant
            gains = soldQuant * soldNav - soldQuant * boughtNav
            if newQuant == 0:
                logging.info("Entire lot of mutual funds sold. Deleting mutual funds from table.")
                cursor.execute(Queries.deleteMutualFund, tuple([schemeCode]))
                cursor.execute(Queries.insertMutualFundInMFTransactions,
                               tuple([schemeCode, schemeName,
                                      soldNav, soldQuant, gains, sellDate]))
                logging.info("Updated the mutual funds transaction table as well.")
                self._dbConnection.commit()
                return True
            setString = f"investmentQuant = {newQuant}, investmentPrice = {newQuant * boughtNav}"
            whereStatement = f" where `schemeCode` = '{schemeCode}'"
            cursor.execute(f"{Queries.editMutualFund} {setString} {whereStatement}")
            if cursor.rowcount > 0:
                logging.info("Successfully updated mutual funds table with the sold quantity")
                cursor.execute(Queries.insertStockInStocksTransactions,
                               tuple([schemeCode, sellDate,
                                      soldNav, soldQuant, gains]))
                logging.info("Updated the mutual funds transaction table as well.")
                self._dbConnection.commit()
                return True
            logging.info("Failed to updated mutual funds table with the added mutual funds details.")
            return False
        except Exception as ex:
            logging.error(f"Error while selling mutual funds {ex}")
            return False

    def addMutualFund(self, addNav, addQuant, schemeCode, oldQuant, oldNav, schemeName, buyDate):
        try:
            cursor = self._dbConnection.cursor()
            newQuant = oldQuant + addQuant
            newNav = ((addNav * addQuant) + (oldQuant * oldNav)) / newQuant
            setString = f"investmentNAV = {newNav},investmentQuant = {newQuant}, investmentPrice = {newNav * newQuant}"
            whereStatement = f" where `schemeCode` = '{schemeCode}'"
            cursor.execute(f"{Queries.editMutualFund} {setString} {whereStatement}")
            if cursor.rowcount > 0:
                logging.info("Successfully updated mutual funds table with the bought quantity and price")
                cursor.execute(Queries.insertMutualFundInMFTransactions, tuple([schemeCode, schemeName,
                                                                                addNav, addQuant, 0, buyDate]))
                logging.info("Updated the mutual funds transaction table as well.")
                self._dbConnection.commit()
                return True
            logging.info("Failed to updated mutual funds table with the added mutual funds details.")
            return False
        except Exception as ex:
            logging.error(f"Error while adding mutual funds {ex}")
            return False

    def insertMutualFundDetails(self, mutualFundData):
        try:
            logging.info("Starting mutual funds details insertion")
            insertionCount = 0
            referenceErrors = 0
            cursor = self._dbConnection.cursor()
            startDateConverted = datetime.datetime.strptime(mutualFundData['schemeStartDate'], '%d-%m-%Y').strftime(
                '%d/%m/%Y')
            lastUpdatedConverted = datetime.datetime.now().strftime("%d/%m/%Y %H:%M")
            insertionTuple = (mutualFundData['schemeCode'], mutualFundData['fundHouse'], mutualFundData['schemeType'],
                              startDateConverted, mutualFundData['schemeStartNav'], mutualFundData['latestNav'],
                              lastUpdatedConverted)
            updateTuple = (mutualFundData['latestNav'], lastUpdatedConverted, mutualFundData['schemeCode'])
            try:
                cursor.execute(Queries.insertMutualFundDetails, insertionTuple)
                logging.info(f"Inserted row {mutualFundData} into mutual funds details table")
                insertionCount += 1
            except IntegrityError:
                referenceErrors += 1
                logging.info(f"Reference error occurred while inserting mutual funds details {mutualFundData}")
                cursor.execute(Queries.updateMutualFundDetails, updateTuple)
                if cursor.rowcount > 0:
                    logging.info("Ran the update query instead. Successfully Updated.")
                    insertionCount += 1
                    referenceErrors -= 1
            logging.info(f"Finished mutual funds details insertion. Inserted {insertionCount} rows.")
            self._dbConnection.commit()
            return True
        except Exception as ex:
            logging.error(f"Error while inserting mutual funds details {ex}")
            return False
