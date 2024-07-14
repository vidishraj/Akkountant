import mysql.connector


from util.logger import logging
from util.queries import Queries
from util.dbReset import DBReset


class FileUploadHandler(DBReset):
    
    __tryCount: int

    def __init__(self, dbConnection):
        super().__init__()
        self._dbConnection = dbConnection

    def updateAuditTable(self, fileDetails: tuple):
        try:
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.insertIntoAuditTable, fileDetails)
            logging.info("Updated the audit table successfully.")
            self._dbConnection.commit()
            return True
        except Exception as ex:
            logging.error(f"Error while updating the audit table. {ex}")
            return False

    def getAuditTableValues(self):
        self._dbConnection.commit()
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.getAuditTableValues)
        tableValues = cursor.fetchall()
        agGridRowData = []
        for row in tableValues:
            agGridRowData.append(
                {
                    "GDriveID": row[0],
                    "uploadDate": row[1],
                    "fileName": row[2],
                    "fileSize": row[3],
                    "transactionCount": row[4],
                    "bank": row[5],
                    "status": row[6],
                }
            )
        return agGridRowData

    def checkFileInCloud(self, fileID):
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.checkIfFileInCloud, tuple([fileID]))
        status = cursor.fetchone()[0]
        if status == 1:
            return True
        return False

    def renameFile(self, fileID, newName):
        logging.info(f"Renaming File with new name {newName}")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.updateFileName, tuple([newName, fileID]))
        rowCount = cursor.rowcount
        cursor.close()
        if rowCount == 1:
            self._dbConnection.commit()
            return True
        return False

    def deleteFileInTable(self, fileID):
        logging.info("deleting file from table")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.deleteFile, tuple([fileID]))
        rowCount = cursor.rowcount
        logging.info(f"Delete attempted {rowCount}")
        cursor.close()
        if rowCount == 1:
            self._dbConnection.commit()
            return True
        return False
