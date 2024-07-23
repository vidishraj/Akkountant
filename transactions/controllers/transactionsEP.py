from flask import jsonify, request
from transactions.parsers.HDFCParsers.EmailParsers.debitCardEmailParser import HDFCDebitEmailParser
from transactions.parsers.YESParser.EmailParsers.creditCardEmailParser import YESCreditEmailParser
from transactions.transactionInstances import TransactionInstances
from util.dbConnector import ConnectionPool
from util.logger import logging
from transactions.parsers.HDFCParsers.EmailParsers.creditCardEmailParser import CreditCardTransactionParser
from transactions.parsers.ICICIParser.EmailParsers.creditCardEmailParser import ICICICreditEmailParser

TransactionInstanceManager = TransactionInstances()
HDFCTransactionInstance = TransactionInstanceManager.HDFCTransactionInstance
ICICITransactionInstance = TransactionInstanceManager.ICICITransactionInstance
BOITransactionInstance = TransactionInstanceManager.BOITransactionInstance
if ConnectionPool is not None:
    GmailInstance = TransactionInstanceManager.GmailInstance.getServiceInstance()
LiveTableInstance = TransactionInstanceManager.LiveTableInstance
YESTransactionInstance = TransactionInstanceManager.YESTransactionInstance


def resetGmailInstance():
    global GmailInstance
    TransactionInstanceManager.GmailInstance.generateServiceInstance()
    GmailInstance = TransactionInstanceManager.GmailInstance.getServiceInstance()


def checkInstanceDBConnections():
    if not BOITransactionInstance.checkDbConnection() or not HDFCTransactionInstance.checkDbConnection() or \
            not ICICITransactionInstance.checkDbConnection():
        logging.error("---DB Connection failed for one instance.")
        return False
    return True


def fetchAllTransactions():
    try:
        logging.info("-----Starting transaction fetching-----")
        if not checkInstanceDBConnections():
            return jsonify({"Error": "DB Connection failed after multiple tries"}), 501
        hdfcTransactions = HDFCTransactionInstance.fetchAllTransactions()
        iciciTransactions = ICICITransactionInstance.fetchAllTransactions()
        boiTransactions = BOITransactionInstance.fetchAllTransactions()
        yesDebitTransactions = YESTransactionInstance.fetchAllDebit()
        yesCreditTransactions = YESTransactionInstance.fetchAllCredit()
        if type(hdfcTransactions) == bool or type(iciciTransactions) == bool or type(boiTransactions) == bool:
            logging.info("Error while fetching transactions.")
            return jsonify({"Error": "Error occurred while fetching transactions"}), 502
        responseObject = {
            "HDFC_Credit": hdfcTransactions[1],
            "HDFC_Debit": hdfcTransactions[0],
            "BOI": boiTransactions,
            "ICICI": iciciTransactions,
            "YES_Debit": yesDebitTransactions,
            "YES_Credit": yesCreditTransactions,
        }
        logging.info("Successfully fetched all transactions.")
        return jsonify({"Transactions": responseObject}), 200
    except Exception as ex:
        logging.info(f"Error while fetching transactions.{ex}")
        return jsonify({"Error": ex.__str__()}), 500
    finally:
        logging.info("----Finished Transaction Fetching----")


def readEmails():
    try:
        logging.info("-----Starting email parsing-----")
        dateFrom = request.form.get('dateFrom')
        dateTo = request.form.get('dateTo')
        if not TransactionInstanceManager.GmailInstance.checkServiceInstance():
            return jsonify(
                {"Auth": TransactionInstanceManager.GmailInstance.getAuthUrl(), "Error": "Error with Gmail API"}), 501
        if not checkInstanceDBConnections():
            return jsonify({"Error": "DB Connection failed after multiple tries"}), 501
        global GmailInstance
        if GmailInstance is None:
            GmailInstance = TransactionInstanceManager.GmailInstance.getServiceInstance()
        HDFCCreditEmailInstance = CreditCardTransactionParser(GmailInstance,
                                                              HDFCTransactionInstance) \
            .creditCardMailParser(dateFrom, dateTo)
        HDFCDebitEmailInstance = HDFCDebitEmailParser(GmailInstance, HDFCTransactionInstance) \
            .debitCardMailParser(dateFrom, dateTo)
        iciciCreditParserInstance = ICICICreditEmailParser(GmailInstance,
                                                           ICICITransactionInstance) \
            .creditCardEmailParser(dateFrom, dateTo)
        YESCreditEmailInstance = YESCreditEmailParser(GmailInstance, YESTransactionInstance) \
            .debitCardMailParser(dateFrom, dateTo)
        returnList = []
        if HDFCDebitEmailInstance:
            returnList.append(1)
        else:
            returnList.append(0)
        if HDFCCreditEmailInstance:
            returnList.append(1)
        else:
            returnList.append(0)
        if iciciCreditParserInstance:
            returnList.append(1)
        else:
            returnList.append(0)
        if YESCreditEmailInstance:
            returnList.append(1)
        else:
            returnList.append(0)
        logging.info(f"Successfully fetched emails with returnValue {returnList.__str__()}")
        return jsonify({"`Transactions`": returnList}), 200
    except Exception as ex:
        if ex.__str__().endswith("'Token has been expired or revoked.'})"):
            return jsonify(
                {"Auth": TransactionInstanceManager.GmailInstance.getAuthUrl(), "Error": "Error with Gmail API"}), 500
        logging.error(f"Error occurred while reading emails {ex}")
        return jsonify({"Error": ex.__str__()}), 500
    finally:
        logging.info("----Finished reading emails.-----")


def fetchLiveTable():
    try:
        if not LiveTableInstance.checkDbConnection():
            logging.error("Error occurred with db connections while fetching live table.")
            return jsonify({"Error": "DB Connection failed or GmailAPI failed after multiple tries"}), 501

        result = LiveTableInstance.fetchLiveTable()
        return jsonify({"Result": result}), 200
    except Exception as ex:
        logging.error(f"Error occurred while fetching live table {ex}")
        return jsonify({"Error": ex.__str__()}), 500
    finally:
        logging.info("----Finished fetching live table-----")


def handleTagChanged():
    try:
        logging.info("-----Starting tag change----")
        postedData = request.get_json(force=True)
        bank = postedData['bank']
        tagRelatedData = postedData['tagRelatedData']
        if not checkInstanceDBConnections():
            logging.error("Error while connection to the DB while changing the tag.")
            return jsonify({"Error": "DB Connection failed after multiple tries"}), 501
        check = True
        if "HDFC" in bank:
            check = HDFCTransactionInstance.updateTag(bank, tagRelatedData['newTag'], tagRelatedData)
        if bank == "ICICI":
            check = ICICITransactionInstance.updateTag(tagRelatedData['newTag'], tagRelatedData['reference'])
        if bank == "BOI":
            check = BOITransactionInstance.updateTag(tagRelatedData['newTag'], tagRelatedData)
        # if bank == "YES":
        return jsonify({"Message": f"Successfully changed tag {check}"}), 200
    except Exception as ex:
        logging.error(f"Error occurred while changing tag {ex}")
        return jsonify({"Error": ex.__str__()}), 500
    finally:
        logging.info("----Finished changing tag-----")


def handleTagChangeForLive():
    try:
        logging.info("-----Starting live table tag change----")
        postedData = request.get_json(force=True)
        tagRelatedData = postedData['tagRelatedData']
        if not checkInstanceDBConnections():
            logging.error("Error while connection to the DB while changing the tag.")
            return jsonify({"Error": "DB Connection failed after multiple tries"}), 501
        HDFCTransactionInstance.updateLiveTag(tagRelatedData['newTag'], tagRelatedData)
        return jsonify({"Message": f"Successfully changed tag "}), 200
    except Exception as ex:
        logging.error(f"Error occurred while changing tag {ex}")
        return jsonify({"Error": ex.__str__()}), 500
    finally:
        logging.info("----Finished changing tag-----")


def handleCreditForLive():
    try:
        logging.info("-----Starting credit addition for live table----")
        postedData = request.get_json(force=True)
        creditRelatedInfo = postedData['creditRelatedInfo']
        if not checkInstanceDBConnections():
            logging.error("Error while connection to the DB while adding credit info.")
            return jsonify({"Error": "DB Connection failed after multiple tries"}), 501
        HDFCTransactionInstance.updateCreditForLive(creditRelatedInfo['newCredit'], creditRelatedInfo)
        return jsonify({"Message": f"Successfully updated credit info"}), 200
    except Exception as ex:
        logging.error(f"Error occurred while adding credit info {ex}")
        return jsonify({"Error": ex.__str__()}), 500
    finally:
        logging.info("----Finished credit addition-----")


def addAutoTag():
    try:
        logging.info("-----Starting tag addition for auto tag table----")
        postedData = request.get_json(force=True)
        details = postedData['details']
        tag = postedData['tag']
        if not LiveTableInstance.checkDbConnection() and checkInstanceDBConnections():
            logging.error("Error while connection to the DB while adding credit info.")
            return jsonify({"Error": "DB Connection failed after multiple tries"}), 501
        LiveTableInstance.addAutoTag(details, tag)
        return jsonify({"Message": f"Successfully updated tags"}), 200
    except Exception as ex:
        logging.error(f"Error occurred while adding tag {ex}")
        return jsonify({"Error": ex.__str__()}), 500
    finally:
        logging.info("----Finished tag addition in auto-tag-----")
