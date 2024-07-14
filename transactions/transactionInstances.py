from transactions.DBHandlers.BOITransactionHandler import BOITransactionHandler
from transactions.DBHandlers.GoogleHandlers import GoogleHandlers
from transactions.DBHandlers.HDFCTransactionHandler import HDFCTransactionHandler
from transactions.DBHandlers.ICICITransactionHandler import ICICITransactionHandler
from transactions.DBHandlers.YESTransactionHandler import YESTransactionHandler
from transactions.DBHandlers.fileUploadHandler import FileUploadHandler
from transactions.DBHandlers.liveTableHandler import LiveTableHandler
from transactions.GDriveUploader.GDriveUpload import GDriveUpload
from transactions.GmailAPI.gmailConnector import GmailApi
from transactions.parsers.BOIParser.BOIDebitParser import BOIDebitParser
from transactions.parsers.HDFCParsers.StatementParsers.creditCardStatementParser import CreditCardStatementParser
from transactions.parsers.HDFCParsers.StatementParsers.debitCardStatementParser import DebitCardStatementParser
from transactions.parsers.ICICIParser.StatementParsers.creditCardStatementParser import ICICICreditCardStatementParser
from util.dbConnector import getConnection, ConnectionPool
from util.dbConnector import InstanceList

class TransactionInstances:
    if ConnectionPool is not None:
        transactionConnectionInstance = getConnection()
        transactionConnectionInstance2 = getConnection()
        transactionConnectionInstance3 = getConnection()
        transactionConnectionInstance4 = getConnection()
        transactionConnectionInstance5 = getConnection()
        transactionConnectionInstance6 = getConnection()
        transactionConnectionInstance7 = getConnection()
        HDFCTransactionInstance = HDFCTransactionHandler(transactionConnectionInstance)
        ICICITransactionInstance = ICICITransactionHandler(transactionConnectionInstance2)
        BOITransactionInstance = BOITransactionHandler(transactionConnectionInstance3)
        FileUploadInstance = FileUploadHandler(transactionConnectionInstance4)
        LiveTableInstance = LiveTableHandler(transactionConnectionInstance5)
        YESTransactionInstance = YESTransactionHandler(transactionConnectionInstance6)
        GoogleHandlerInstance = GoogleHandlers(transactionConnectionInstance7)

        InstanceList.append(HDFCTransactionInstance)
        InstanceList.append(ICICITransactionInstance)
        InstanceList.append(BOITransactionInstance)
        InstanceList.append(FileUploadInstance)
        InstanceList.append(LiveTableInstance)
        InstanceList.append(YESTransactionInstance)
        InstanceList.append(GoogleHandlerInstance)

        HDFCCreditInstance = CreditCardStatementParser(HDFCTransactionInstance)
        HDFCDebitInstance = DebitCardStatementParser(HDFCTransactionInstance)
        ICICIInstance = ICICICreditCardStatementParser(ICICITransactionInstance)
        BOIInstance = BOIDebitParser(BOITransactionInstance)

        GDriveInstance = GDriveUpload(GoogleHandlerInstance)
        GmailInstance = GmailApi(GoogleHandlerInstance)
    else:
        transactionConnectionInstance = None
        transactionConnectionInstance2 = None
        transactionConnectionInstance3 = None
        transactionConnectionInstance4 = None
        transactionConnectionInstance5 = None
        transactionConnectionInstance6 = None
        transactionConnectionInstance7 = None
        HDFCTransactionInstance = None
        ICICITransactionInstance = None
        BOITransactionInstance = None
        FileUploadInstance = None
        LiveTableInstance = None
        YESTransactionInstance = None
        GoogleHandlerInstance = None
        HDFCCreditInstance = None
        HDFCDebitInstance = None
        ICICIInstance = None
        BOIInstance = None
        GDriveInstance = None
        GmailInstance = None




