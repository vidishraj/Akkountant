from util.logger import logging
from flask import jsonify, request

from investments.investmentInstances import InvestmentInstances

ppfServiceInstance = InvestmentInstances.ppfServiceInstance
ppfHandlerInstance = InvestmentInstances.ppfHandlerInstance


def recalculatePPF():
    try:
        if ppfHandlerInstance.checkDbConnection():
            logging.info("-----Started Recalculating PPF table values-----")
            ppfServiceInstance.recalculatePPFValues()
            return jsonify({"Message": f"Successfully updated ppf table."}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while calculating PPF table values {ex}"}), 500
    finally:
        logging.info("----Finished Recalculating PPF values-----")


def fetchPPFDeposits():
    try:
        if ppfHandlerInstance.checkDbConnection():
            logging.info("-----Fetching PPF Deposits-----")
            return jsonify({"Message": ppfServiceInstance.fetchAllDeposits()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching PPF deposits {ex}"}), 500
    finally:
        logging.info("----Finished fetching PPF Deposits-----")


def fetchPPFInterest():
    try:
        if ppfHandlerInstance.checkDbConnection():
            logging.info("-----Fetching PPF Interest -----")
            return jsonify({"Message": ppfServiceInstance.fetchAllPPFInterest()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching ppf interest {ex}"}), 500
    finally:
        logging.info("----Finished fetching PPF interest-----")


def fetchPPF():
    try:
        if ppfHandlerInstance.checkDbConnection():
            logging.info("-----Fetching PPF Table-----")
            return jsonify({"Message": ppfServiceInstance.fetchAllPPF()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while fetching ppf table {ex}"}), 500
    finally:
        logging.info("----Finished fetching PPF table-----")


def insertPPFDeposit():
    try:
        if ppfHandlerInstance.checkDbConnection():
            logging.info("-----Starting PPF deposit insertion-----")
            postedDate = request.get_json(force=True)
            depositDate, depositAmount = postedDate['depositDate'], postedDate['depositAmount']
            if ppfServiceInstance.insertDeposit(depositDate, depositAmount):
                return jsonify({"Message": "Inserted deposit successfully."}), 200
            else:
                return jsonify({"Error": "Error while inserting deposit."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while inserting deposit. {ex}"}), 500
    finally:
        logging.info("----Finished PPF Deposit insertion-----")


def insertPPFInterest():
    try:
        if ppfHandlerInstance.checkDbConnection():
            logging.info("-----Started PPF interest insertion-----")
            postedDate = request.get_json(force=True)
            month, interestRate = postedDate['month'], postedDate['interestRate']
            if ppfServiceInstance.insertDeposit(month, interestRate):
                return jsonify({"Message": "Inserted interest successfully."}), 200
            else:
                return jsonify({"Error": "Error while inserting interest."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while inserting interest. {ex}"}), 500
    finally:
        logging.info("----Finished PPF interest insertion -----")


def deletePPFDeposit():
    try:
        if ppfHandlerInstance.checkDbConnection():
            logging.info("-----Starting PPF deposit deletion-----")
            depositID = request.form.get('id')
            if ppfServiceInstance.deletePPFDeposit(depositID):
                return jsonify({"Message": "Successfully deleted deposit"}), 200
            else:
                return jsonify({"Error": "Error while deleting deposit"}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while deleting deposit {ex}"}), 500
    finally:
        logging.info("----Finished PPF deposit deletion-----")
