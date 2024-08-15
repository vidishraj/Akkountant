from transactions.StatementFetcher.BankTypes import BankTypes
from util.fileHelpers import getDateForStatementCron
from util.interceptor import requestInterceptor
from util.logger import logging
from flask import Flask, jsonify
from flask_cors import CORS
from transactions.controllers import transactionsEP
from transactions.controllers import fileUploadEP
from transactions.controllers import googleApiEP
from investments.controllers import ppfEP, fdEp, goldEP, stocksEP, mutualFundsEP, pfEp, npsEP
from util.dbConnector import InstanceList
from flask_apscheduler import APScheduler

logging.info("-----Starting Accountant------")


def flaskSetter(flaskInstance):
    try:
        logging.info("Setting up flask endpoints")

        def awake():
            logging.info("Cron check on server.")
            return jsonify({"Message": "Server is awake"}), 200

        def dbReconnect():
            hourlyDbCheck(flaskInstance)

        def statementCheck():
            statementChecks(flaskInstance)

        flaskInstance.add_url_rule('/awake', methods=['GET'], view_func=awake)
        flaskInstance.add_url_rule('/reConnectDB', methods=['GET'], view_func=dbReconnect)
        flaskInstance.add_url_rule('/runStatementCron', methods=['GET'], view_func=statementCheck)

        flaskInstance.add_url_rule('/fetchAll', methods=['GET'], view_func=transactionsEP.fetchAllTransactions)
        flaskInstance.add_url_rule('/changeTag', methods=['POST'], view_func=transactionsEP.handleTagChanged)
        flaskInstance.add_url_rule('/readEmail', methods=['POST'], view_func=transactionsEP.readEmails)
        flaskInstance.add_url_rule('/readStatements', methods=['POST'], view_func=fileUploadEP.readStatements)

        flaskInstance.add_url_rule('/fetchLiveTable', methods=['GET'], view_func=transactionsEP.fetchLiveTable)
        flaskInstance.add_url_rule('/updateLiveTableTag', methods=['POST'],
                                   view_func=transactionsEP.handleTagChangeForLive)
        flaskInstance.add_url_rule('/updateCreditInfo', methods=['POST'],
                                   view_func=transactionsEP.handleCreditForLive)
        flaskInstance.add_url_rule('/addAutoTag', methods=['POST'], view_func=transactionsEP.addAutoTag)
        flaskInstance.add_url_rule('/renameFile', methods=['POST'], view_func=fileUploadEP.renameFile)
        flaskInstance.add_url_rule('/deleteFile', methods=['POST'], view_func=fileUploadEP.deleteFile)
        flaskInstance.add_url_rule('/downloadFile', methods=['POST'], view_func=fileUploadEP.downloadFile)
        flaskInstance.add_url_rule('/uploadStatement', methods=['POST'], view_func=fileUploadEP.uploadFile)
        flaskInstance.add_url_rule('/getFileStatus', methods=['GET'], view_func=fileUploadEP.getFileStatus)

        flaskInstance.add_url_rule('/updateGmailToken', methods=['POST'], view_func=googleApiEP.saveGmailToken)
        flaskInstance.add_url_rule('/updateGDriveToken', methods=['POST'], view_func=googleApiEP.saveGDriveToken)

        flaskInstance.add_url_rule('/updatePPF', methods=['GET'], view_func=ppfEP.recalculatePPF)
        flaskInstance.add_url_rule('/fetchPPFDeposit', methods=['GET'], view_func=ppfEP.fetchPPFDeposits)
        flaskInstance.add_url_rule('/fetchPPF', methods=['GET'], view_func=ppfEP.fetchPPF)
        flaskInstance.add_url_rule('/fetchPPFInterest', methods=['GET'], view_func=ppfEP.fetchPPFInterest)
        flaskInstance.add_url_rule('/insertPPFDeposit', methods=['POST'], view_func=ppfEP.insertPPFDeposit)
        flaskInstance.add_url_rule('/insertPPFInterest', methods=['POST'], view_func=ppfEP.insertPPFInterest)
        flaskInstance.add_url_rule('/deletePPFDeposit', methods=['POST'], view_func=ppfEP.deletePPFDeposit)

        flaskInstance.add_url_rule('/fetchFD', methods=['GET'], view_func=fdEp.fetchFDDeposit)
        flaskInstance.add_url_rule('/addFD', methods=['POST'], view_func=fdEp.insertFDDeposit)
        flaskInstance.add_url_rule('/deleteFD', methods=['POST'], view_func=fdEp.deleteFDDeposit)

        flaskInstance.add_url_rule('/fetchGold', methods=['GET'], view_func=goldEP.fetchGoldDeposits)
        flaskInstance.add_url_rule('/fetchGoldRates', methods=['GET'], view_func=goldEP.fetchGoldRate)
        flaskInstance.add_url_rule('/insertGoldDeposit', methods=['POST'], view_func=goldEP.insertGoldDeposit)
        flaskInstance.add_url_rule('/recalibrateGoldRates', methods=['GET'], view_func=goldEP.recalibrateGoldRates)
        flaskInstance.add_url_rule('/deleteGoldDeposit', methods=['POST'], view_func=goldEP.deleteGoldDeposit)
        flaskInstance.add_url_rule('/fetchGold', methods=['GET'], view_func=goldEP.fetchGoldDeposits)
        flaskInstance.add_url_rule('/fetchGoldRates', methods=['GET'], view_func=goldEP.fetchGoldRate)
        flaskInstance.add_url_rule('/insertGoldDeposit', methods=['POST'], view_func=goldEP.insertGoldDeposit)
        flaskInstance.add_url_rule('/recalibrateGoldRates', methods=['GET'], view_func=goldEP.recalibrateGoldRates)
        flaskInstance.add_url_rule('/deleteGoldDeposit', methods=['POST'], view_func=goldEP.deleteGoldDeposit)

        flaskInstance.add_url_rule('/fetchStocks', methods=['GET'], view_func=stocksEP.fetchStocks)
        flaskInstance.add_url_rule('/fetchMarketStatus', methods=['GET'], view_func=stocksEP.fetchMarketStatus)
        flaskInstance.add_url_rule('/fetchStockPriceWithCode', methods=['POST'],
                                   view_func=stocksEP.fetchRandomStockPrice)
        flaskInstance.add_url_rule('/fetchStocksTransactions', methods=['GET'],
                                   view_func=stocksEP.fetchStocksTransactions)
        flaskInstance.add_url_rule('/refreshStockPrices', methods=['GET'], view_func=stocksEP.updateStockPrices)
        flaskInstance.add_url_rule('/insertStock', methods=['POST'], view_func=stocksEP.insertStock)
        flaskInstance.add_url_rule('/sellStock', methods=['POST'], view_func=stocksEP.sellStock)
        flaskInstance.add_url_rule('/addStock', methods=['POST'], view_func=stocksEP.addStock)

        flaskInstance.add_url_rule('/fetchMf', methods=['GET'], view_func=mutualFundsEP.fetchAllMutualFunds)
        flaskInstance.add_url_rule('/fetchMfWithCode', methods=['POST'],
                                   view_func=mutualFundsEP.fetchRandomMutualFundDetails)
        flaskInstance.add_url_rule('/fetchMfTransactions', methods=['GET'], view_func=mutualFundsEP.fetchMfTransactions)
        flaskInstance.add_url_rule('/refreshMf', methods=['GET'], view_func=mutualFundsEP.updateMutualFundsDetails)
        flaskInstance.add_url_rule('/insertMf', methods=['POST'], view_func=mutualFundsEP.insertMutualFund)
        flaskInstance.add_url_rule('/sellMf', methods=['POST'], view_func=mutualFundsEP.sellMutualFunds)
        flaskInstance.add_url_rule('/addMf', methods=['POST'], view_func=mutualFundsEP.addMutualFunds)

        flaskInstance.add_url_rule('/fetchPF', methods=['GET'], view_func=pfEp.fetchPF)
        flaskInstance.add_url_rule('/fetchPFInterestRates', methods=['GET'], view_func=pfEp.fetchPFInterestRates)
        flaskInstance.add_url_rule('/fetchPFInterest', methods=['GET'], view_func=pfEp.fetchPFInterest)
        flaskInstance.add_url_rule('/insertPF', methods=['POST'], view_func=pfEp.insertPF)
        flaskInstance.add_url_rule('/editPF', methods=['POST'], view_func=pfEp.editPF)
        flaskInstance.add_url_rule('/insertPFInterest', methods=['POST'], view_func=pfEp.insertPFInterest)
        flaskInstance.add_url_rule('/recalculatePF', methods=['GET'], view_func=pfEp.recalculatePF)

        flaskInstance.add_url_rule('/fetchNPS', methods=['GET'], view_func=npsEP.fetchAllNPS)
        flaskInstance.add_url_rule('/fetchNPSTransactions', methods=['GET'], view_func=npsEP.fetchNPSTransactions)
        flaskInstance.add_url_rule('/fetchNPSScheme', methods=['POST'], view_func=npsEP.fetchRandomScheme)
        flaskInstance.add_url_rule('/insertNPS', methods=['POST'], view_func=npsEP.insertNPS)
        flaskInstance.add_url_rule('/sellNPS', methods=['POST'], view_func=npsEP.sellNPS)
        flaskInstance.add_url_rule('/addNPS', methods=['POST'], view_func=npsEP.addNPS)
        flaskInstance.add_url_rule('/refreshNPS', methods=['GET'], view_func=npsEP.refreshNPS)

        CORS(flaskInstance)
        flaskInstance.config["DEBUG"] = False
        logging.info("Finished setting up flask endpoints.")
        return flaskInstance
    except Exception as ex:
        logging.error(f"Error while setting flask endpoints. {ex}")


def hourlyDbCheck(appInst: Flask):
    with appInst.app_context():
        try:
            logging.info("Checking db status hourly.")
            for instances in InstanceList:
                if type(instances).__name__ != "StatementFetcher" and instances.checkDbConnection():
                    logging.info(f"Db connection is still alive for {instances.__class__}.")
                elif type(instances).__name__ == "StatementFetcher":
                    continue
                else:
                    logging.info(f"Db connection is failing in hourly check. {instances.__class__}")
            return jsonify({"Message": f"Db connection reset successful"}), 200
        except Exception as ex:
            logging.info(f"Error while performing hourly db check. {ex}")

            return jsonify({"Error": f"Error while resetting db Connections. {ex}"}), 500


def statementChecks(appInst: Flask):
    with appInst.app_context():
        try:
            """
                Cron job to call every 10 days to check mail for statements.
            """
            logging.info("Starting statement checks.")
            today, tenDaysAgo = getDateForStatementCron()
            StatementFetcherInstance = None
            for instance in InstanceList:
                if type(instance).__name__ == "StatementFetcher":
                    StatementFetcherInstance = instance
            for bank in BankTypes:
                logging.info(f"Looking for mail from {bank.bank}")
                StatementFetcherInstance.startParsing(bank, today, tenDaysAgo)
            return
        except Exception as ex:
            logging.error(f"Error while looking for statements in mail. {ex}")


app = Flask(__name__)
app = flaskSetter(app)
app.before_request(requestInterceptor)
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.add_job(id="hourlyDbCheck", func=lambda: hourlyDbCheck(app), trigger='interval', hours=1)
scheduler.add_job(id="biWeeklyStatementCheck", func=lambda: statementChecks(app), trigger='interval', days=10)
scheduler.start()

# if __name__ == "__main__":
#     app.run(debug=True, port=8000, use_reloader=False)
