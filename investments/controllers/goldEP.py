from util.logger import logging
from flask import jsonify, request

from investments.investmentInstances import InvestmentInstances

goldServiceInstance = InvestmentInstances.goldServiceInstance
goldHandlerInstance = InvestmentInstances.goldHandlerInstance

def fetchGoldDeposits():
    try:
        if goldHandlerInstance.checkDbConnection():
            logging.info("-----Fetching Gold Deposits-----")
            return jsonify({"Message": goldServiceInstance.fetchAllDeposits()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501

    except Exception as ex:
        return jsonify({"Error": f"Error while fetching Gold deposits {ex}"}), 500
    finally:
        logging.info("----Finished fetching Gold Deposits-----")


def fetchGoldRate():
    try:
        if goldHandlerInstance.checkDbConnection():
            logging.info("-----Fetching Gold Rates -----")
            return jsonify({"Message": goldServiceInstance.fetchGoldRates()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching Gold Rates {ex}"}), 500
    finally:
        logging.info("----Finished fetching Gold Rates-----")


def insertGoldDeposit():
    try:

        logging.info("-----Starting gold deposit insertion-----")
        postedData = request.get_json(force=True)
        if goldHandlerInstance.checkDbConnection():
            if goldServiceInstance.insertGoldDeposit(postedData['purchaseDate'], postedData['itemDesc'],
                                                 postedData['goldType'], postedData['amount'],
                                                 postedData['quantity']):
                return jsonify({"Message": "Inserted deposit successfully."}), 200
            else:
                return jsonify({"Error": "Error while inserting deposit."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while inserting gold deposit. {ex}"}), 500
    finally:
        logging.info("----Finished gold Deposit insertion-----")


def deleteGoldDeposit():
    try:
        logging.info("-----Starting gold deposit deletion-----")
        depositID = request.form.get('id')
        if goldHandlerInstance.checkDbConnection():
            if goldServiceInstance.deletePurchase(depositID):
                return jsonify({"Message": "Successfully deleted deposit"}), 200
            else:
                return jsonify({"Error": "Error while deleting deposit"}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while deleting gold deposit {ex}"}), 500
    finally:
        logging.info("----Finished gold deposit deletion-----")


def recalibrateGoldRates():
    try:
        if goldHandlerInstance.checkDbConnection():
            logging.info("-----Starting gold rate recalibration -----")
            if goldServiceInstance.recalibrateGoldRates():
                return jsonify({"Message": "Recalibrated gold rates"}), 200
            else:
                return jsonify({"Error": "Error while recalibrating gold rates."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while recalibrating gold rates. {ex}"}), 500
    finally:
        logging.info("----Finished gold rate recalibration-----")
