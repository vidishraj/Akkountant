from util.logger import logging
from flask import jsonify, request

from investments.investmentInstances import InvestmentInstances

pfServiceInstance = InvestmentInstances.pfServiceInstance
pfHandlerInstance = InvestmentInstances.pfHandlerInstance

def fetchPF():
    try:
        if pfHandlerInstance.checkDbConnection():
            logging.info("-----Fetching PF Data-----")
            return jsonify({"Message": pfServiceInstance.fetchAllPf()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching PF data {ex}"}), 500
    finally:
        logging.info("----Finished fetching PF Data-----")


def fetchPFInterest():
    try:
        if pfHandlerInstance.checkDbConnection():
            logging.info("-----Fetching PF Interest-----")
            return jsonify({"Message": pfServiceInstance.fetchPfInterest()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching PF interest {ex}"}), 500
    finally:
        logging.info("----Finished fetching PF interest-----")


def fetchPFInterestRates():
    try:
        if pfHandlerInstance.checkDbConnection():
            logging.info("-----Fetching PF interest rates-----")
            return jsonify({"Message": pfServiceInstance.fetchPfInterestRates()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching PF interest rates {ex}"}), 500
    finally:
        logging.info("----Finished fetching PF rates-----")


def insertPF():
    try:
        if pfHandlerInstance.checkDbConnection():
            logging.info("-----Starting PF insertion-----")
            postedDate = request.get_json(force=True)
            if pfServiceInstance.insertPF(postedDate["rows"]):
                return jsonify({"Message": "Inserted Pf successfully."}), 200
            else:
                return jsonify({"Error": "Error while inserting pf."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while inserting pf. {ex}"}), 500
    finally:
        logging.info("----Finished PF insertion-----")


def editPF():
    try:
        if pfHandlerInstance.checkDbConnection():
            logging.info("-----Starting PF edit-----")
            postedDate = request.get_json(force=True)
            if pfServiceInstance.editPF(postedDate["rows"]):
                return jsonify({"Message": "Edited deposit successfully."}), 200
            else:
                return jsonify({"Error": "Error while editing pf."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while editing pf. {ex}"}), 500
    finally:
        logging.info("----Finished PF Deposit edit-----")


def recalculatePF():
    try:
        if pfHandlerInstance.checkDbConnection():
            logging.info("-----Recalculating PF values-----")
            return jsonify({"Message": pfServiceInstance.recalculateInterest()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Finished recalculating PF {ex}"}), 500
    finally:
        logging.info("----Finished recalculating PF -----")
