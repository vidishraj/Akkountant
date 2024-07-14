from util.logger import logging
from flask import jsonify, request

from investments.investmentInstances import InvestmentInstances

fdServiceInstance = InvestmentInstances.fdServiceInstance
fdHandlerInstance = InvestmentInstances.fdHandlerInstance


def fetchFDDeposit():
    try:
        if fdHandlerInstance.checkDbConnection():
            logging.info("-----Fetching FD Deposits-----")
            return jsonify({"Message": fdServiceInstance.fetchAllFD()}), 200
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501

    except Exception as ex:
        return jsonify({"Error": f"Error while fetching FD deposits {ex}"}), 500
    finally:
        logging.info("----Finished fetching FD Deposits-----")


def insertFDDeposit():
    try:
        logging.info("-----Starting FD deposit insertion-----")
        postedData = request.get_json(force=True)
        if fdHandlerInstance.checkDbConnection():
            if fdServiceInstance.insertFDDeposit(postedData['investmentAmount'], postedData['interestRate'],
                                                 postedData['duration'], postedData['tenure'],
                                                 postedData['bank'], postedData['depositDate'],
                                                 postedData['maturityAmount']):
                return jsonify({"Message": "Inserted deposit successfully."}), 200
            else:
                return jsonify({"Error": "Error while inserting deposit."}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while inserting FD deposit. {ex}"}), 500
    finally:
        logging.info("----Finished FD Deposit insertion-----")


def deleteFDDeposit():
    try:
        logging.info("-----Starting FD deposit deletion-----")
        depositID = request.form.get('id')
        if fdHandlerInstance.checkDbConnection():
            if fdServiceInstance.deleteFDDeposit(depositID):
                return jsonify({"Message": "Successfully deleted deposit"}), 200
            else:
                return jsonify({"Error": "Error while deleting deposit"}), 501
        else:
            return jsonify({"Error": "DB Connection Failed"}), 501
    except Exception as ex:
        return jsonify({"Error": f"Error while deleting FD deposit {ex}"}), 500
    finally:
        logging.info("----Finished FD deposit deletion-----")
