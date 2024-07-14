from datetime import datetime
from nsepythonserver import nse_eq, nse_marketStatus
from util.logger import logging
from investments.stocks.stocksHandler import StocksHandler


def fetchStockPrice(symbol):
    try:
        stockInfo = nse_eq(symbol)
        if stockInfo is None:
            return {}
        priceInfo = {'currentPrice': stockInfo['priceInfo']['lastPrice'],
                     'dayOpen': stockInfo['priceInfo']['open'],
                     'dayClose': stockInfo['priceInfo']['close'],
                     'valueChange': stockInfo['priceInfo']['change'],
                     'percentChange': stockInfo['priceInfo']['pChange']}
        return priceInfo
    except Exception as ex:
        logging.error(f"Error while fetching live quote of {symbol} {ex}")


def fetchCompleteStockDetails(symbol):
    try:
        stockInfo = nse_eq(symbol)
        if stockInfo is None:
            return {}
        priceInfo = {
            'symbol': stockInfo['info'].get('symbol'),
            'stockName': stockInfo['info'].get('companyName'),
            'industry': stockInfo['industryInfo'].get('industry'),
            'currentPrice': stockInfo['priceInfo'].get('lastPrice'),
            'change': stockInfo['priceInfo'].get('change'),
            'percentChange': stockInfo['priceInfo'].get('pChange'),
            'dayOpen': stockInfo['priceInfo'].get('open'),
            'dayClose': stockInfo['priceInfo'].get('close'),
            'prevClose': stockInfo['priceInfo'].get('previousClose'),
            'dayHigh': stockInfo['priceInfo']['intraDayHighLow'].get('max'),
            'dayLow': stockInfo['priceInfo']['intraDayHighLow'].get('min'),
            'volume': stockInfo['preOpenMarket'].get('totalBuyQuantity', 0) + stockInfo['preOpenMarket'].get(
                'totalSellQuantity', 0),
            'daySellQuant': stockInfo['preOpenMarket'].get('totalBuyQuantity', 0),
            'dayBuyQuant': stockInfo['preOpenMarket'].get('totalSellQuantity', 0)
        }
        return priceInfo
    except Exception as ex:
        logging.error(f"Error while fetching live quote of {symbol} {ex}")


class StockService:
    Handler: StocksHandler

    def __init__(self, goldHandler: StocksHandler):
        self.Handler = goldHandler

    def fetchAllTransactions(self):
        return self.Handler.fetchStocksTransactions()

    def fetchMarketStatus(self):
        return {"Market Status": nse_marketStatus()['marketState'][0]['marketStatus']}

    def fetchAllStocks(self):
        resultDict = self.Handler.fetchJoinedStocks()
        return resultDict

    def insertStock(self, stockCode, stockName, purchasePrice, purchaseQuant):
        if purchasePrice < 0 or purchaseQuant < 0:
            return False
        return self.Handler.insertStock(tuple([stockCode, stockName, purchasePrice, purchaseQuant]))

    def sellStock(self, soldQuant, soldPrice, stockCode, oldQuant, oldPrice):
        return self.Handler.sellStock(soldQuant, soldPrice, stockCode, oldQuant, oldPrice)

    def addStock(self, addPrice, addQuant, stockCode, oldQuant, oldPrice):
        return self.Handler.addStock(addPrice, addQuant, stockCode, oldQuant, oldPrice)

    def updateStockPrices(self):
        stockTuple = self.Handler.fetchStocksTable()
        stockCodes = [stock[0] for stock in stockTuple]
        currentTime = datetime.now().strftime('%d/%m/%Y %H:%M')
        globalStatus = False
        for stockCode in stockCodes:
            priceData = fetchCompleteStockDetails(stockCode)
            if len(priceData) > 0:
                status = self.Handler.insertStockPrice(tuple([stockCode, priceData["currentPrice"], currentTime,
                                                              priceData["dayOpen"], priceData["dayClose"],
                                                              priceData["change"], priceData["percentChange"],
                                                              priceData['prevClose'],
                                                              priceData["dayOpen"], priceData["dayLow"],
                                                              priceData["volume"], priceData['industry']]))
                globalStatus = status

        return globalStatus
