import datetime

from mysql.connector import IntegrityError

from util.dbReset import DBReset
from util.queries import Queries
from util.logger import logging
from util.dbReset import DBReset


class NPSHandler(DBReset):

    def __init__(self, dbConnection):
        super().__init__()
        self._dbConnection = dbConnection

    def fetchAllNPS(self):
        try:
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchAllNPS)
            NPS = cursor.fetchall()
            response = []
            for deposit in NPS:
                response.append({
                    "schemeCode": deposit[0],
                    "schemeName": deposit[2],
                    "fmCode": deposit[1],
                    "fmName": deposit[8],
                    "investedNav": deposit[3],
                    "investedAmount": deposit[5],
                    "investedQuant": deposit[4],
                    "yearLow": deposit[9],
                    "yearHigh": deposit[10],
                    "topSectors": deposit[11],
                    "topHoldings": deposit[12],
                    'inceptionDate': deposit[13],
                    'currentNAV': deposit[14],
                    'lastUpdated': deposit[15]
                })
            cursor.close()
            return response
        except Exception as ex:
            logging.error(f"Error while fetching NPS details. {ex}")
            return False

    def fetchOnlyNpsTable(self):
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.fetchOnlyNpsTable)
        nps = cursor.fetchall()
        cursor.close()
        return nps

    def fetchTransactions(self):
        try:
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchNPSTransactions)
            NPS = cursor.fetchall()
            cursor.close()
            result_dict = {}
            # transactionID, schemeCode, fmCode, gain, changeNAV, changeQuant, transactionDate
            for item in NPS:
                transactionID, schemeCode, fmCode, gain, changeNAV, changeQuant, transactionDate = item
                transaction_type = "BUY" if gain == 0.0 else "SELL"

                if schemeCode not in result_dict:
                    result_dict[schemeCode] = []

                result_dict[schemeCode].append({
                    "date": transactionDate,
                    "nav": changeNAV,
                    "amount": changeQuant * changeNAV,
                    "quantity": changeQuant,
                    "type": transaction_type,
                    "gains": gain
                })

            return result_dict
        except Exception as ex:
            logging.error(f"Error while fetching NPS. {ex}")
            return False

    def insertNPS(self, npsData, purchaseDate):
        try:
            logging.info("Starting nps insertion")
            insertionCount = 0
            referenceErrors = 0
            cursor = self._dbConnection.cursor()
            try:
                cursor.execute(Queries.insertNPS, npsData)
                logging.info(f"Inserted row {npsData} into nps table")
                cursor.execute(Queries.insertNPSTransaction, tuple([npsData[0], npsData[1],
                                                                    0, npsData[2],
                                                                    npsData[3], purchaseDate]))
                logging.info(f"Inserted row {npsData} into nps transaction table")
                insertionCount += 1
            except IntegrityError:
                referenceErrors += 1
                logging.info(f"Reference error occurred while inserting nps {npsData}")
            logging.info(f"Finished nps insertion. Inserted {insertionCount} rows.")
            self._dbConnection.commit()
            return True
        except Exception as ex:
            logging.error(f"Error while inserting nps {ex}")
            return False

    def sellNPS(self, soldQuant, soldNav, schemeCode, boughtNav, boughtQuant, sellDate, fmCode):
        try:
            cursor = self._dbConnection.cursor()
            newQuant = boughtQuant - soldQuant
            gains = soldQuant * soldNav - soldQuant * boughtNav
            if newQuant == 0:
                logging.info("Entire lot of nps sold. Deleting nps from table.")
                cursor.execute(Queries.deleteNPS, tuple([schemeCode]))
                cursor.execute(Queries.insertNPSTransaction,
                               tuple([schemeCode, fmCode, gains,
                                      soldNav, soldQuant, sellDate]))
                logging.info("Updated the nps transaction table as well.")
                self._dbConnection.commit()
                return True
            setString = f"investedQuantity = {newQuant}, investedAmount = {newQuant * boughtNav}"
            whereStatement = f" where `schemeCode` = '{schemeCode}'"
            cursor.execute(f"{Queries.editNPS} {setString} {whereStatement}")
            if cursor.rowcount > 0:
                logging.info("Successfully updated nps table with the sold quantity")
                cursor.execute(Queries.insertNPSTransaction,
                               tuple([schemeCode, fmCode, gains,
                                      soldNav, soldQuant, sellDate]))
                logging.info("Updated the nps transaction table as well.")
                self._dbConnection.commit()
                return True
            logging.info("Failed to updated nps table with the added nps details.")
            return False
        except Exception as ex:
            logging.error(f"Error while selling nps {ex}")
            return False

    def addNPS(self, addNav, addQuant, schemeCode, oldQuant, oldNav, buyDate, fmCode):
        try:
            cursor = self._dbConnection.cursor()
            newQuant = oldQuant + addQuant
            newNav = ((addNav * addQuant) + (oldQuant * oldNav)) / newQuant
            setString = f"investedNAV = {newNav},investedQuantity = {newQuant}, investedAmount = {newNav * newQuant}"
            whereStatement = f" where `schemeCode` = '{schemeCode}'"
            cursor.execute(f"{Queries.editNPS} {setString} {whereStatement}")
            if cursor.rowcount > 0:
                logging.info("Successfully updated nps table with the bought quantity and price")
                cursor.execute(Queries.insertNPSTransaction, tuple([schemeCode, fmCode, 0,
                                                                    addNav, addQuant, buyDate]))
                logging.info("Updated the nps transaction table as well.")
                self._dbConnection.commit()
                return True
            logging.info("Failed to updated nps table with the added nps details.")
            return False
        except Exception as ex:
            logging.error(f"Error while adding nps {ex}")
            return False

    def updateNPS(self, schemeCode, npsData: dict):
        try:
            logging.info("Starting NPS details insertion")
            insertionCount = 0
            referenceErrors = 0
            cursor = self._dbConnection.cursor()
            inceptionDate = datetime.datetime.strptime(npsData['Inception Date'], '%d-%m-%Y').strftime(
                '%d/%m/%Y')
            lastUpdatedConverted = datetime.datetime.now().strftime("%d/%m/%Y %H:%M")
            insertionTuple = (schemeCode, npsData['Scheme Name'], npsData['PFM Name'],
                              npsData['52 Week Low'], npsData['52 week High'], npsData['Top 3 Sectors'], npsData['Top 5 Holdings'],
                              inceptionDate, npsData['currentNav'], lastUpdatedConverted)
            updateTuple = (npsData['currentNav'], lastUpdatedConverted, schemeCode)
            try:
                cursor.execute(Queries.insertNPSDetails, insertionTuple)
                logging.info(f"Inserted row {insertionTuple[1]} into NPS details table")
                insertionCount += 1
            except IntegrityError:
                referenceErrors += 1
                logging.info(f"Reference error occurred while inserting NPS details for {insertionTuple[1]}")
                cursor.execute(Queries.updateNPSDetails, updateTuple)
                if cursor.rowcount > 0:
                    logging.info("Ran the update query instead. Successfully Updated.")
                    insertionCount += 1
                    referenceErrors -= 1
            logging.info(f"Finished NPS details insertion. Inserted {insertionCount} rows.")
            self._dbConnection.commit()
            return True
        except Exception as ex:
            logging.error(f"Error while inserting NPS details {ex}")
            return False
