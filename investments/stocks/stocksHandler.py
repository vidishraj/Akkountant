from datetime import datetime

import mysql.connector
from mysql.connector.errors import IntegrityError

from util.queries import Queries
from util.logger import logging

from util.dbReset import DBReset

class StocksHandler(DBReset):
    

    def __init__(self, dbConnection):
        super().__init__()
        self._dbConnection = dbConnection

    def fetchStocksTransactions(self):
        try:
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchStocksTransactions)
            transactions = cursor.fetchall()
            result_dict = {}

            for item in transactions:
                id, name, date, amount, quantity, gains = item
                transaction_type = "BUY" if gains == 0.0 else "SELL"

                if name not in result_dict:
                    result_dict[name] = []

                result_dict[name].append({
                    "date": date,
                    "amount": amount,
                    "quantity": quantity,
                    "type": transaction_type,
                    "gains": gains
                })
            cursor.close()
            return result_dict
        except Exception as ex:
            logging.error(f"Error while fetching stocks transactions. {ex}")

    def fetchJoinedStocks(self):
        try:
            self._dbConnection.commit()
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchStocks)
            stocks = cursor.fetchall()
            cursor.close()
            arrayToDict = []
            for stock in stocks:
                arrayToDict.append({
                    "stockName": stock[1],
                    "symbol": stock[0],
                    "quantity": stock[3],
                    "price": stock[2],
                    "lastUpdated": stock[5],
                    "currentPrice": stock[6],
                    "dayOpen": stock[7],
                    "dayClose": stock[8],
                    "change": stock[9],
                    "percentChange": stock[10],
                    "prevClose":stock[11],
                    "dayHigh": stock[12],
                    "dayLow": stock[13],
                    "volume": stock[14],
                    "industry": stock[15],
                })
            cursor.close()
            return arrayToDict
        except Exception as ex:
            logging.error(f"Error while fetching stocks. {ex}")
            return False

    def fetchStocksTable(self):
        try:
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.fetchStocksFromMainTable)
            stocks = cursor.fetchall()
            cursor.fetchall()
            return stocks
        except Exception as ex:
            logging.info(f"Error while fetching main stocks table. {ex}")

    def insertStock(self, stockData):
        try:
            logging.info("Starting stock insertion")
            insertionCount = 0
            referenceErrors = 0
            cursor = self._dbConnection.cursor()
            try:
                cursor.execute(Queries.addStock, stockData)
                logging.info(f"Inserted row {stockData} into stock table")
                cursor.execute(Queries.insertStockInStocksTransactions, tuple([stockData[0],
                                                                               datetime.now().strftime("%d/%m/%Y"),
                                                                               stockData[2], stockData[3], 0]))
                logging.info(f"Inserted row {stockData} into stocks transaction table")
                insertionCount += 1
            except IntegrityError:
                referenceErrors += 1
                logging.info(f"Reference error occurred while inserting stock {stockData}")
            logging.info(f"Finished stock insertion. Inserted {insertionCount} rows.")
            self._dbConnection.commit()
            return True
        except Exception as ex:
            logging.error(f"Error while inserting stock {ex}")
            return False

    def sellStock(self, soldQuant, soldPrice, stockCode, oldQuant, oldPrice):
        try:
            cursor = self._dbConnection.cursor()
            newQuant = oldQuant - soldQuant
            gains = soldQuant * soldPrice - soldQuant * oldPrice
            if newQuant == 0:
                logging.info("Entire lot of stock sold. Deleting stock from table.")
                cursor.execute(Queries.deleteStock, tuple([stockCode]))
                cursor.execute(Queries.insertStockInStocksTransactions,
                               tuple([stockCode, datetime.now().strftime("%d/%m/%Y"),
                                      soldPrice, soldQuant, gains]))
                logging.info("Updated the stocks transaction table as well.")
                self._dbConnection.commit()
                return True
            setString = f"purchaseQuant = {newQuant}"
            whereStatement = f" where `stockCode` = '{stockCode}'"
            cursor.execute(f"{Queries.editStock} {setString} {whereStatement}")
            if cursor.rowcount > 0:
                logging.info("Successfully updated stocks table with the sold quantity")
                cursor.execute(Queries.insertStockInStocksTransactions,
                               tuple([stockCode, datetime.now().strftime("%d/%m/%Y"),
                                      soldPrice, soldQuant, gains]))
                logging.info("Updated the stocks transaction table as well.")
                self._dbConnection.commit()
                return True
            logging.info("Failed to updated stocks table with the added stocks details.")
            return False
        except Exception as ex:
            logging.error(f"Error while selling stock {ex}")
            return False

    def addStock(self, addPrice, addQuant, stockCode, oldQuant, oldPrice):
        try:
            cursor = self._dbConnection.cursor()
            newQuant = oldQuant + addQuant
            newPrice = ((addPrice * addQuant) + (oldQuant * oldPrice)) / newQuant
            setString = f"purchasePrice = {newPrice},purchaseQuant = {newQuant}"
            whereStatement = f" where `stockCode` = '{stockCode}'"
            cursor.execute(f"{Queries.editStock} {setString} {whereStatement}")
            if cursor.rowcount > 0:
                logging.info("Successfully updated stocks table with the bought quantity and price")
                cursor.execute(Queries.insertStockInStocksTransactions,
                               tuple([stockCode, datetime.now().strftime("%d/%m/%Y"),
                                      addPrice, addQuant, 0]))
                logging.info("Updated the stocks transaction table as well.")
                self._dbConnection.commit()
                return True
            logging.info("Failed to updated stocks table with the added stocks details.")
            return False
        except Exception as ex:
            logging.error(f"Error while adding stock {ex}")
            return False

    def insertStockPrice(self, stockData):
        try:
            logging.info("Starting stock price insertion")
            insertionCount = 0
            referenceErrors = 0
            cursor = self._dbConnection.cursor()
            try:
                cursor.execute(Queries.insertStockPrice, stockData)
                logging.info(f"Inserted row {stockData} into stock price table")
                insertionCount += 1
            except IntegrityError:
                referenceErrors += 1
                logging.info(f"Reference error occurred while inserting stock price {stockData}")
                cursor.execute(Queries.updateStockPrices, tuple([stockData[1], stockData[2], stockData[3], stockData[4],
                                                                 stockData[5], stockData[6], stockData[8],
                                                                 stockData[9], stockData[10], stockData[7],
                                                                 stockData[0]]))
                if cursor.rowcount > 0:
                    logging.info("Ran the update query instead. Successfully Updated.")
                    insertionCount += 1
                    referenceErrors -= 1
            logging.info(f"Finished stock price insertion. Inserted {insertionCount} rows.")
            self._dbConnection.commit()
            return True
        except Exception as ex:
            logging.error(f"Error while inserting stock price {ex}")
            return False
