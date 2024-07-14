from investments.stocks.stocksService import fetchCompleteStockDetails
from util.logger import logging
from flask import jsonify, request

from investments.investmentInstances import InvestmentInstances

stockServiceInstance = InvestmentInstances.stockServiceInstance
stockHandlerInstance = InvestmentInstances.stockHandlerInstance


def fetchStocks():
    try:
        if stockHandlerInstance.checkDbConnection():
            logging.info("-----Fetching Stocks -----")
            return jsonify({"Message": stockServiceInstance.fetchAllStocks()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching Stocks {ex}"}), 500
    finally:
        logging.info("----Finished fetching Stocks -----")


def fetchMarketStatus():
    try:
        if stockHandlerInstance.checkDbConnection():
            logging.info("-----Fetching Market Status -----")
            return jsonify({"Message": stockServiceInstance.fetchMarketStatus()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching market status {ex}"}), 500
    finally:
        logging.info("----Finished fetching market status -----")


def fetchStocksTransactions():
    try:
        if stockHandlerInstance.checkDbConnection():
            logging.info("-----Fetching Stocks Transactions-----")
            return jsonify({"Message": stockServiceInstance.fetchAllTransactions()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching Stocks {ex}"}), 500
    finally:
        logging.info("----Finished fetching Stocks -----")


def insertStock():
    try:
        if stockHandlerInstance.checkDbConnection():
            logging.info("-----Starting stock insertion-----")
            postedData = request.get_json(force=True)
            if stockServiceInstance.insertStock(postedData['stockCode'], postedData['stockName'],
                                                postedData['purchasePrice'], postedData['purchaseQuant']):
                return jsonify({"Message": "Inserted stock successfully."}), 200
            else:
                return jsonify({"Error": "Error while inserting stock."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while inserting stock. {ex}"}), 500
    finally:
        logging.info("----Finished stock insertion-----")


def sellStock():
    try:
        if stockHandlerInstance.checkDbConnection():
            logging.info("----- Starting stock sale-----")
            postedData = request.get_json(force=True)
            if stockServiceInstance.sellStock(postedData['soldQuant'], postedData['soldPrice'], postedData["stockCode"],
                                              postedData["oldQuant"], postedData["oldPrice"]):
                return jsonify({"Message": "Sold stocks successfully."}), 200
            else:
                return jsonify({"Error": "Error while selling stocks."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while selling stocks {ex}"}), 500
    finally:
        logging.info("----Finished stock deletion-----")


def addStock():
    try:
        if stockHandlerInstance.checkDbConnection():
            logging.info("-----Adding more stock-----")
            postedData = request.get_json(force=True)
            if stockServiceInstance.addStock(postedData['addedPrice'], postedData['addedQuant'],
                                             postedData["stockCode"],
                                             postedData["oldQuant"], postedData["oldPrice"]):
                return jsonify({"Message": "Added stock successfully."}), 200
            else:
                return jsonify({"Error": "Error while adding stock."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while adding stock. {ex}"}), 500
    finally:
        logging.info("----Finished stock addition-----")


def updateStockPrices():
    try:
        if stockHandlerInstance.checkDbConnection():
            logging.info("-----Starting stock price update-----")
            if stockServiceInstance.updateStockPrices():
                return jsonify({"Message": "Updated stock prices successfully."}), 200
            else:
                return jsonify({"Error": "Error while updating stock prices."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while updating stock prices. {ex}"}), 500
    finally:
        logging.info("----Finished  updating stock prices -----")


def fetchRandomStockPrice():
    stockCode = request.form.get('stockCode')
    try:
        logging.info(f"-----Fetching Stock Price for {stockCode}-----")
        stockInfo = fetchCompleteStockDetails(stockCode)
        if len(stockInfo) > 0:
            return jsonify({"Message": stockInfo}), 200
        else:
            return jsonify({"Error": "Error while fetching stock prices."}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching stock prices. {ex}"}), 500
    finally:
        logging.info(f"----Finished  fetching stock price for {stockCode} -----")
