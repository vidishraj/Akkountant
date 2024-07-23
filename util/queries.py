from util.dbConnector import Config


class Queries:
    schema: str = Config['schema']

    """ICICI Credit Card related  queries"""

    fetchAllICICITransactions: str = f"Select * from {schema}.IciciCardTransactions;"

    updateICICITag: str = f"UPDATE {schema}.IciciCardTransactions SET tag = %s where reference = %s"

    insertIntoICICICreditTb = f"INSERT INTO {schema}.IciciCardTransactions \
                         (`date`,`reference`,`details`,`rewardPoints`,`amount`, `fileID`,`tag`)\
                         VALUES (%s, %s, %s, %s, %s, %s, %s);"
    deleteFromICICI = f"DELETE FROM `{schema}`.`IciciCardTransactions` where fileID = %s"

    """BOI Debit Card related queries"""
    updateBOITag: str = f"UPDATE {schema}.`BoiCardTransactions` SET `tag` = %s WHERE `date` = %s AND `details` = %s " \
                        f"AND `amount` = %s AND `balance` = %s;"

    fetchAllBOITransactions: str = f"Select * from {schema}.BoiCardTransactions;"

    insertIntoBOITable = f"INSERT INTO {schema}.BoiCardTransactions \
                             (`date`,`details`,`amount`,`balance`, `fileID`,`tag`)\
                             VALUES (%s, %s, %s, %s,%s, %s);"

    deleteFromBOI = f"DELETE FROM `{schema}`.`BoiCardTransactions` where fileID = %s"

    """ HDFC Debit Card related queries"""

    fetchAllHDFCDebitTransactions: str = f"Select * from {schema}.HdfcCardDebitTransactions;"

    insertIntoHDFCDebitTb = f"INSERT INTO {schema}.`HdfcCardDebitTransactions`\
        (`date`,`details`,`amount`,`closingAmount`,`tag`,`reference`, `fileID`)\
        VALUES (%s, %s, %s, %s, %s, %s, %s);"

    updateHDFCDebitTag: str = f"UPDATE {schema}.`HdfcCardDebitTransactions` SET `tag` = %s WHERE `reference` = %s;"

    deleteFromHDFCDebit = f"DELETE FROM `{schema}`.`HdfcCardDebitTransactions` where fileID = %s"

    """HDFC Credit card related queries"""
    fetchAllHDFCCreditTransactions: str = f"Select * from {schema}.HdfcCardCreditTransactions;"

    updateHDFCCreditTag: str = f"UPDATE {schema}.`HdfcCardCreditTransactions`SET`tag` = %s WHERE `date` = %s AND " \
                               f"`details` = %s AND `amount` = %s;"

    insertIntoHDFCCreditTb = f"INSERT INTO {schema}.`HdfcCardCreditTransactions` (`date`,`details`,`amount`, `fileID`," \
                             f"`tag`) VALUES (%s, %s, %s,%s,%s);"

    deleteFromHDFCCredit = f"DELETE FROM `{schema}`.`HdfcCardCreditTransactions` where fileID = %s"

    """ YES Bank  Queries"""

    fetchAllYesBankDebit: str = f"Select * from {schema}.YesCardDebitTransactions ;"

    fetchAllYesBankCredit: str = f"Select * from {schema}.YesCardCreditTransactions ;"

    insertIntoYESCreditTb = "INSERT INTO `sql12650047`.`YesCardCreditTransactions`(`date`,`details`,`amount`,`tag`," \
                            "`reference`,`fileID`) VALUES (%s, %s, %s, %s, %s, %s);"

    insertIntoYESDebitTb = f"INSERT INTO {schema}.`YesCardDebitTransactions`\
            (`date`,`details`,`amount`,`balance`,`tag`, `fileID`)\
            VALUES (%s, %s, %s, %s, %s, %s);"

    """Common transaction Queries"""

    insertIntoLiveTable: str = f"INSERT INTO {schema}.`currentMonthTransactions` (`date`,`description`,`amount`," \
                               f"`tag`,`bank`)" \
                               " VALUES (%s, %s, %s, %s, %s);"

    fetchFromLiveTable: str = f"Select * from {schema}.`currentMonthTransactions`;"

    deleteAllInLiveTable: str = f"Delete from {schema}.`currentMonthTransactions`;"

    updateCreditInfoInLiveTable: str = f"Update {schema}.`currentMonthTransactions` SET `credit` = %s WHERE `date` = " \
                                       f"%s AND " \
                                       f"`description` = %s AND `amount` = %s;"

    updateLiveTableTag: str = f"UPDATE {schema}.`currentMonthTransactions` SET`tag` = %s WHERE `date` = %s AND " \
                              f"`description` = %s AND `amount` = %s;"

    insertTagIntoAutoTag: str = f"Insert into {schema}.autoTags(`details`,`tag`) Values(%s,%s);"

    updateLiveTableAfterAutoTag: str = f"Update {schema}.`currentMonthTransactions` SET`tag` = %s where `description` "\
                                       f"= %s "
    updateHDFCCreditAfterAutoTag: str = f"Update {schema}.`HdfcCardCreditTransactions` SET `tag` = %s WHERE details = %s"
    updateHDFCDebitAfterAutoTag: str = f"Update {schema}.`HdfcCardDebitTransactions` SET `tag` = %s where details = %s "
    updateICICIAfterAutoTag: str = f"Update {schema}.`IciciCardTransactions` SET `tag` = %s where details = %s "
    updateBOIAfterAutoTag: str = f"Update {schema}.`BoiCardTransactions` SET `tag` = %s where details = %s "
    findTag: str = f"Select tag from {schema}.autoTags where details = %s "
    """Audit Queries"""

    insertIntoAuditTable: str = (f" INSERT INTO {schema}.`uploadedFilesAudit` (`driveFileID`,`uploadDate`,`fileName`,"
                                 f"`fileSize`,`numberOfStatements`,`bank`, `status`) VALUES ( %s, %s, %s, %s, %s, %s, "
                                 f"%s);")

    getAuditTableValues: str = f"SELECT * FROM {schema}.uploadedFilesAudit;"

    checkIfFileInCloud: str = f" Select count(*) from {schema}.uploadedFilesAudit where `driveFileID`=%s;"

    updateFileName: str = f"UPDATE {schema}.uploadedFilesAudit SET `fileName` = %s where(`driveFileID` = %s)"

    deleteFile: str = f"Delete from {schema}.uploadedFilesAudit where (`driveFileID` = %s);"

    """Google Token Queries"""

    getGmailToken: str = f"Select * from {schema}.googletokentable where type='Gmail';"

    getDriveToken: str = f"Select * from {schema}.googletokentable where type='Drive';"

    deleteGmailToken: str = f"Delete from {schema}.googletokentable where type = 'Gmail';"

    deleteDriveToken: str = f"Delete from {schema}.googletokentable where type = 'Drive';"

    insertGmailToken: str = f"INSERT INTO `{schema}`.`googletokentable` (`token`,`refresh_token`,`client_id`," \
                            f"`client_secret`,`expiry`,`type`) VALUES (%s, %s, %s, %s, %s, %s) "

    insertDriveToken: str = f"INSERT INTO `{schema}`.`googletokentable` (`token`,`refresh_token`,`client_id`," \
                            "`client_secret`,`expiry`,`type`) VALUES (%s, %s, %s, %s, %s, %s)"

    """ PPF Queries"""

    fetchAllDeposits: str = f"Select * FROM `{schema}`.`ppfDeposits`;"

    fetchAllPPFInterestRates: str = f"Select * FROM `{schema}`.`PPFInterestRates`;"

    fetchAllPPFTable: str = f"Select * FROM `{schema}`.`ppfTable`"

    insertIntoPPFTable: str = f"INSERT INTO `{schema}`.`ppfTable` (`month`,`openingBalance`,`interest`," \
                              f"`closingBalance`) VALUES (%s, %s, %s, %s) "

    insertIntoPPFDeposit: str = f"INSERT INTO `{schema}`.`ppfDeposits`(`depositDate`,`depositAmount`) VALUES(%s, %s);"

    insertIntoPPFInterestTable: str = f"INSERT INTO `{schema}`.`PPFInterestRates` (`monthYear`,`interestRate`) VALUES(" \
                                      f"%s, %s) "

    deleteAllFromPPFTable: str = f" Delete from `{schema}`.`ppfTable`;"

    deletePPFDeposit: str = f"DELETE FROM `{schema}`.`ppfDeposits` WHERE `depositID`= %s;"

    deleteFromPPFInterestTable: str = f""

    """ FD Queries """

    fetchAllFDDeposits: str = f"Select * from `{schema}`.`fdTable`;"

    insertFDDeposit: str = f"INSERT INTO `{schema}`.`fdTable` (`investmentDate`,`investedAmount`," \
                           f"`interestRate`,`compoundTenure`,`investmentDuration`,`investmentBank`," \
                           f"`maturityAmount`) VALUES (%s, %s, %s, %s, %s, %s, %s); "

    deleteFDDeposit: str = f"Delete from `{schema}`.`fdTable` where depositID = %s ;"

    """ Gold Queries """

    fetchGoldDeposit: str = f" Select * from `{schema}`.`goldTable`"

    insertGoldPurchase: str = f"INSERT INTO `{schema}`.`goldTable` (`purchaseDate`,`itemDesc`,`goldType`,`amount`," \
                              f"`quantity`) VALUES (%s, %s, %s, %s, %s) "

    deleteGoldPurchase: str = f"DELETE FROM `{schema}`.`goldTable` where goldID = %s;"

    insertGoldRate: str = f"INSERT INTO `{schema}`.`goldRateTable` (`updatedTime`,`goldType`,`goldRate`) VALUES (%s, " \
                          f"%s, %s) "

    updateGoldRate = f"Update `{schema}`.`goldRateTable` Set `goldRate`= %s, `updatedTime`= %s where goldType = %s"

    fetchGoldRates: str = f"Select * FROM `{schema}`.`goldRateTable`"

    """ Stocks Queries """

    fetchStocks: str = f"SELECT * FROM {schema}.stocksTable  right join stocksPrice on stocksTable.stockCode = " \
                       f"stocksPrice.stockCode"

    fetchStocksTransactions: str = f"Select * from {schema}.stocksTransactionsTable;"

    fetchStocksFromMainTable: str = f"Select * from {schema}.stocksTable;"

    addStock: str = f"Insert into  `{schema}`.`stocksTable` (`stockCode`,`stockName`,`purchasePrice`,`purchaseQuant`)" \
                    f"VALUES (%s, %s, %s, %s)"

    insertStockInStocksTransactions: str = f"Insert into `{schema}`.`stocksTransactionsTable` (`stockCode`," \
                                           f"`transactionDate`,`changePrice`,`changeQuant`,`gains`) VALUES " \
                                           f"(%s, %s, %s, %s, %s);"

    deleteStock: str = f"Delete from `{schema}`.`stocksTable` where stockCode = %s"

    editStock: str = f"Update `{schema}`.`stocksTable` Set "

    insertStockPrice: str = f"Insert into `{schema}`.`stocksPrice` (`stockCode`,`stockPrice`,`lastUpdated`, " \
                            f"`dayOpen`, `dayClose`, `valueChange`, `percentChange`,prevClose, `dayHigh`, `dayLow`, " \
                            f"`volume`,`industry`) VALUES" \
                            f"(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"

    updateStockPrices: str = f"Update `{schema}`.`stocksPrice` Set `stockPrice` = %s, `lastUpdated` = %s, dayOpen =%s," \
                             f"dayClose = %s, valueChange = %s, percentChange = %s, dayHigh = %s, dayLow = %s," \
                             f" volume = %s, prevClose = %s " \
                             f"where stockCode = %s;"
    """ NPS Queries """

    fetchAllNPS: str = f"SELECT * FROM {schema}.npsTable as p inner join {schema}.npsRateTable as t on " \
                       f"p.schemeCode=t.schemeCode;"

    fetchOnlyNpsTable: str = f"Select * from {schema}.npsTable;"

    fetchNPSTransactions: str = f"SELECT * FROM {schema}.npsTransactions;"

    insertNPSDetails: str = f"INSERT INTO {schema}.npsRateTable (`schemeCode`,`schemeName`,`fmName`,`yearLow`," \
                            f"`yearHigh`,`topSectors`,`topHoldings`,`inceptionDate`,`currentNAV`,`lastUpdated`) VALUES" \
                            f"(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"

    updateNPSDetails: str = f"Update `{schema}`.`npsRateTable` Set `currentNAV` = %s, lastUpdated = %s" \
                            f"where schemeCode = %s;"

    insertNPS: str = f"INSERT INTO {schema}.`npsTable` (`schemeCode`,`fmCode`,`schemeName`,`investedNAV`," \
                     f"`investedQuantity`,`investedAmount`) VALUES (%s, %s, %s, %s, %s, %s)"

    insertNPSTransaction: str = f"INSERT INTO {schema}.`npsTransactions`(`schemeCode`,`fmCode`," \
                                f"`gain`,`changeNAV`,`changeQuant`,`transactionDate`) VALUES(%s, %s, %s, %s, %s, %s);"

    deleteNPS: str = f" Delete from `{schema}`.`npsTable` where schemeCode = %s;"

    editNPS: str = f"Update `{schema}`.`npsTable` Set"

    """ Mutual Fund Queries """

    fetchMutualFunds: str = f"SELECT * FROM {schema}.mfTable right join mfRateTable on mfTable.schemeCode = " \
                            f"mfRateTable.schemeCode;"

    fetchOnlyMfTable: str = f"Select * from {schema}.mfTable;"

    fetchMutualFundsTransactions: str = f"SELECT * FROM sql12650047.mfTransactions;"

    addMutualFund: str = f"INSERT INTO `{schema}`.`mfTable` (`schemeCode`,`schemeName`,`investmentNAV`," \
                         f"`investmentQuant`,`investmentPrice`) VALUES (%s, %s, %s, %s, %s)"

    insertMutualFundInMFTransactions: str = f"INSERT INTO `{schema}`.`mfTransactions` (`schemeCode`, `schemeName`," \
                                            f"`changePrice`,`changeQuant`,`gain`,`purchaseDate`) VALUES (%s, %s, %s, " \
                                            f"%s, %s, %s)"

    deleteMutualFund: str = f" Delete from `{schema}`.`mfTable` where schemeCode = %s;"
    editMutualFund: str = f"Update `{schema}`.`mfTable` Set"
    insertMutualFundDetails: str = f"INSERT INTO `{schema}`.`mfRateTable` (`schemeCode`,`fundHouse`,`schemeType`," \
                                   f"`schemeStartDate`,`schemeStartNAV`,`latestNAV`,`lastUpdated`) " \
                                   f"VALUES (%s, %s, %s, %s, %s, %s, %s)"

    updateMutualFundDetails: str = f"Update `{schema}`.`mfRateTable` Set `latestNAV` = %s, lastUpdated = %s" \
                                   f"where schemeCode = %s;"

    """ PF Queries """

    fetchPF: str = f"Select * from {schema}.pfTable;"

    insertPF: str = f"Insert into {schema}.pfTable (`wageMonth`,`EPFWage`,`empShare`,`emplyrShare`,`total`) " \
                    f"values (%s, %s, %s, %s, %s);"

    deletePF: str = f"Delete from {schema}.pfTable;"

    fetchPFRates: str = f"Select * from {schema}.pfInterestRates;"

    fetchPFInterest: str = f"Select * from {schema}.pfInterest;"

    insertPFInterest: str = f"Insert into {schema}.pfInterest (`year`, `interest`) values (%s, %s);"

    deleteAllPFInterest: str = f"Delete from {schema}.pfInterest;"
