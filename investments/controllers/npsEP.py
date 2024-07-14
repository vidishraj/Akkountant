from investments.nps.npsService import getNPSDetails
from util.logger import logging
from flask import jsonify, request
from investments.investmentInstances import InvestmentInstances

npsServiceInstance = InvestmentInstances.npsServiceInstance
npsHandlerInstance = InvestmentInstances.npsHandlerInstance


def fetchAllNPS():
    try:
        if npsHandlerInstance.checkDbConnection():
            logging.info("-----Fetching NPS Data-----")
            return jsonify({"Message": npsServiceInstance.fetchAllDeposits()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501

    except Exception as ex:
        return jsonify({"Error": f"Error while fetching NPS Data {ex}"}), 500
    finally:
        logging.info("----Finished fetching NPS Data-----")


def fetchNPSTransactions():
    try:
        if npsHandlerInstance.checkDbConnection():
            logging.info("-----Fetching NPS transactions -----")
            return jsonify({"Message": npsServiceInstance.fetchNPSTransactions()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching NPS transactions {ex}"}), 500
    finally:
        logging.info("----Finished fetching NPS -----")


def refreshNPS():
    try:
        logging.info("-----Starting NPS details update-----")
        if npsHandlerInstance.checkDbConnection():
            if npsServiceInstance.refreshNPS():
                return jsonify({"Message": "Updated NPS details successfully."}), 200
            else:
                return jsonify({"Error": "Error while updating NPS details."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while updating NPS details. {ex}"}), 500
    finally:
        logging.info("----Finished updating NPS details -----")


def fetchRandomScheme():
    schemeCode = request.form.get('schemeCode')
    fmCode = request.form.get('fmCode')
    try:
        logging.info(f"-----Fetching NPS details for {schemeCode}-----")
        npsInfo = getNPSDetails(fmCode, schemeCode)
        if len(npsInfo) > 0:
            return jsonify({"Message": npsInfo}), 200
        else:
            return jsonify({"Error": "Error while fetching NPS details."}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching NPS details. {ex}"}), 500
    finally:
        logging.info(f"----Finished  fetching NPS details for {schemeCode} -----")


def insertNPS():
    try:
        logging.info("-----Starting nps data insertion-----")
        postedData = request.get_json(force=True)
        if npsHandlerInstance.checkDbConnection():
            if npsServiceInstance.insertNPS(postedData['schemeCode'], postedData['fmCode'],
                                            postedData['schemeName'], postedData['investmentNAV'],
                                            postedData['investmentQuant'], postedData["purchaseDate"]):
                return jsonify({"Message": "Inserted nps data successfully."}), 200
            else:
                return jsonify({"Error": "Error while inserting nps data."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while inserting nps data. {ex}"}), 500
    finally:
        logging.info("----Finished nps data insertion-----")


def sellNPS():
    try:
        logging.info("----- Starting nps data sale-----")
        postedData = request.get_json(force=True)
        if npsHandlerInstance.checkDbConnection():
            if npsServiceInstance.sellNPS(postedData['soldQuant'], postedData["soldNav"],
                                          postedData["schemeCode"], postedData["boughtNav"],
                                          postedData["boughtQuant"],
                                          postedData["sellDate"], postedData["fmCode"]):
                return jsonify({"Message": "Sold nps data successfully."}), 200
            else:
                return jsonify({"Error": "Error while selling nps data."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while selling nps data {ex}"}), 500
    finally:
        logging.info("----Finished nps data sale-----")


def addNPS():
    try:
        logging.info("-----Adding more nps data-----")
        postedData = request.get_json(force=True)
        if npsHandlerInstance.checkDbConnection():
            if npsServiceInstance.addNPS(postedData['addNav'], postedData['addQuant'], postedData["schemeCode"],
                                         postedData["oldQuant"], postedData["oldNav"],
                                         postedData["buyDate"], postedData["fmCode"]):
                return jsonify({"Message": "Added nps data successfully."}), 200
            else:
                return jsonify({"Error": "Error while adding nps data."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while adding nps data. {ex}"}), 500
    finally:
        logging.info("----Finished nps data addition-----")
