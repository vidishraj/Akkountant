from investments.mutualFunds.mfService import getMutualFundDetails
from util.logger import logging
from flask import jsonify, request

from investments.investmentInstances import InvestmentInstances

mutualFundsService = InvestmentInstances.mutualFundsService
mutualFundsHandlerInstance = InvestmentInstances.mutualFundsHandler

def fetchAllMutualFunds():
    try:
        logging.info("-----Fetching mutual funds -----")
        if mutualFundsHandlerInstance.checkDbConnection():
            return jsonify({"Message": mutualFundsService.fetchAllMutualFunds()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching mutual funds {ex}"}), 500
    finally:
        logging.info("----Finished fetching mutual funds -----")


def fetchMfTransactions():
    try:
        if mutualFundsHandlerInstance.checkDbConnection():
            logging.info("-----Fetching mutual funds transactions -----")
            return jsonify({"Message": mutualFundsService.fetchMutualFundsTransactions()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching mutual funds transactions {ex}"}), 500
    finally:
        logging.info("----Finished fetching mutual funds -----")


def insertMutualFund():
    try:
        logging.info("-----Starting mutual funds insertion-----")
        postedData = request.get_json(force=True)
        if mutualFundsHandlerInstance.checkDbConnection():
            if mutualFundsService.insertMutualFund(postedData['schemeCode'], postedData['schemeName'],
                                                   postedData['investmentNAV'], postedData['investmentQuant'],
                                                   postedData["purchaseDate"]):
                return jsonify({"Message": "Inserted mutual funds successfully."}), 200
            else:
                return jsonify({"Error": "Error while inserting mutual funds."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while inserting mutual funds. {ex}"}), 500
    finally:
        logging.info("----Finished mutual funds insertion-----")


def sellMutualFunds():
    try:
        logging.info("----- Starting mutual funds sale-----")
        postedData = request.get_json(force=True)
        if mutualFundsHandlerInstance.checkDbConnection():
            if mutualFundsService.sellMutualFunds(postedData['soldQuant'], postedData['schemeName'], postedData["soldNav"],
                                                  postedData["schemeCode"], postedData["boughtNav"],
                                                  postedData["boughtQuant"],
                                                  postedData["sellDate"]):
                return jsonify({"Message": "Sold mutual funds successfully."}), 200
            else:
                return jsonify({"Error": "Error while selling mutual funds."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while selling mutual funds {ex}"}), 500
    finally:
        logging.info("----Finished mutual funds sale-----")


def addMutualFunds():
    try:
        logging.info("-----Adding more mutual funds-----")
        postedData = request.get_json(force=True)
        if mutualFundsHandlerInstance.checkDbConnection():
            if mutualFundsService.addMutualFunds(postedData['addNav'], postedData['addQuant'], postedData["schemeCode"],
                                                 postedData["oldQuant"], postedData["oldNav"],
                                                 postedData["schemeName"],
                                                 postedData["buyDate"]):
                return jsonify({"Message": "Added mutual funds successfully."}), 200
            else:
                return jsonify({"Error": "Error while adding mutual funds."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while adding mutual funds. {ex}"}), 500
    finally:
        logging.info("----Finished mutual funds addition-----")


def updateMutualFundsDetails():
    try:
        logging.info("-----Starting mutual funds details update-----")
        if mutualFundsHandlerInstance.checkDbConnection():
            if mutualFundsService.updateMutualFundsDetails():
                return jsonify({"Message": "Updated mutual funds details successfully."}), 200
            else:
                return jsonify({"Error": "Error while updating mutual funds details."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while updating mutual funds details. {ex}"}), 500
    finally:
        logging.info("----Finished updating mutual funds details -----")


def fetchRandomMutualFundDetails():
    schemeCode = request.form.get('schemeCode')
    try:
        logging.info(f"-----Fetching mutual funds details for {schemeCode}-----")
        stockInfo = getMutualFundDetails(schemeCode)
        if len(stockInfo) > 0:
            return jsonify({"Message": stockInfo}), 200
        else:
            return jsonify({"Error": "Error while fetching mutual funds details."}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching mutual funds details. {ex}"}), 500
    finally:
        logging.info(f"----Finished  fetching mutual funds details for {schemeCode} -----")
