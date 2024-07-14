import mysql.connector
from mysql.connector.errors import IntegrityError

from util.queries import Queries
from util.logger import logging
from datetime import datetime
from util.dbReset import DBReset


class PFHandler(DBReset):
    

    def __init__(self, dbConnection):
        super().__init__()
        self._dbConnection = dbConnection



    def fetchAllPf(self):
        self._dbConnection.commit()
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.fetchPF)
        pfList = cursor.fetchall()
        keys = ['wageMonth', 'EPFWage', 'empShare', 'emplyrShare', 'total']
        result = []
        for pf in pfList:
            result.append({keys[i]: value for i, value in enumerate(pf)})
        cursor.close()
        return result

    def fetchAllPfInterestRates(self):
        logging.info("Fetching interest rates")
        self._dbConnection.commit()
        cursor = self._dbConnection.cursor()
        keys = ['year', 'interestRate']
        cursor.execute(Queries.fetchPFRates)
        pfRates = cursor.fetchall()
        result = []
        for pf in pfRates:
            result.append({keys[i]: value for i, value in enumerate(pf)})
        cursor.close()
        return result

    def fetchAllPfInterest(self):
        self._dbConnection.commit()
        cursor = self._dbConnection.cursor()
        keys = ['year', 'interest']
        cursor.execute(Queries.fetchPFInterest)
        pfRates = cursor.fetchall()
        result = []
        for pf in pfRates:
            result.append({keys[i]: value for i, value in enumerate(pf)})
        cursor.close()
        return result

    def insertPF(self, pfRows: list):
        try:
            logging.info("Starting PF insertion")
            insertionCount = 0
            referenceErrors = 0
            cursor = self._dbConnection.cursor()
            for row in pfRows:
                try:
                    cursor.execute(Queries.insertPF, tuple(row))
                    logging.info(f"Inserted row {row} into pf table")
                    insertionCount += 1
                except IntegrityError:
                    referenceErrors += 1
                    logging.info(f"Reference error occurred while inserting pf {row}")
            logging.info(f"Finished PF Insertion. Inserted {insertionCount} rows.")
            self._dbConnection.commit()
            return True
        except Exception as ex:
            logging.error(f"Error while inserting rows in to pf table. {ex}")
            return False

    def insertPFInterest(self, row):
        logging.info(f"Inserting interest for year {row[0]}")
        cursor = self._dbConnection.cursor()
        cursor.execute(Queries.insertPFInterest, row)
        logging.info(f"Inserted row {row} into pf table")
        return

    def deleteAllPF(self):
        try:
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.deletePF)
            logging.info(f"{cursor.rowcount}")
            self._dbConnection.commit()
            return True
        except Exception as ex:
            logging.error(f"Error while deleting all PF {ex}")
            return False

    def deleteAllPFInterest(self):
        try:
            cursor = self._dbConnection.cursor()
            cursor.execute(Queries.deleteAllPFInterest)
            logging.info(f"{cursor.rowcount}")
            self._dbConnection.commit()
            return True
        except Exception as ex:
            logging.error(f"Error while deleting all PF Interest{ex}")
            return False

    def editPF(self, rowList):
        try:
            logging.info("Starting PF edit")
            if self.deleteAllPF() and self.deleteAllPFInterest():
                logging.info("Deleted everything")
                if self.recalculatePF(rowList):
                    logging.info("Edit is complete")
                    return True
                else:
                    logging.info("Error while editing PF")
                    return False
            else:
                return False
        except Exception as ex:
            logging.error(f"Error while editing PF {ex}")
            return False

    def sortPfByMonth(self, data):
        months = {
            'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4,
            'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8,
            'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
        }

        def sort_key(item):
            month, year = item[0].split('-')
            return datetime.strptime(f"{months[month]}-{year}", "%m-%Y")

        return sorted(data, key=sort_key)

    def remaining_months(self, last_item):
        months_order = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]

        current_date = datetime.now()
        current_month = current_date.month
        current_year = current_date.year

        last_month_str, last_year_str = last_item.split('-')
        last_month = months_order.index(last_month_str)
        last_year = int(last_year_str)

        remaining = []
        for year in range(last_year, current_year + 1):
            start_month = last_month + 1 if year == last_year else 0
            end_month = 12 if year != current_year else current_month

            for month in range(start_month, end_month):
                month_name = months_order[month]
                remaining.append(f"{month_name}-{year}")

        return remaining

    def recalculatePF(self, pfRows):
        if self._dbConnection.in_transaction:
            self._dbConnection.commit()  # or connection.rollback()
        self._dbConnection.start_transaction()
        try:
            logging.info("Recalculating PF Interest")
            if len(pfRows) == 0:
                editedPFRows = []
                pfRows = self.fetchAllPf()
                for index, pf in enumerate(pfRows):
                    pfKeys = pf.keys()
                    currentItem = []
                    for item in pfKeys:
                        if item != 'total':
                            currentItem.append(pfRows[index][item])
                    editedPFRows.append(tuple(currentItem))
                pfRows = self.sortPfByMonth(editedPFRows)
                remainingMonths = self.remaining_months(pfRows[-1][0])
                for months in remainingMonths:
                    pfRows.append([months, pfRows[-1][1], pfRows[-1][2], pfRows[-1][3]])
                self.deleteAllPF()
                self.deleteAllPFInterest()
            interestDict = {}
            pfRates = self.fetchAllPfInterestRates()

            for yearRange in pfRates:
                years = yearRange['year'].split('-')
                interestDict[years[0]] = yearRange['interestRate']
                interestDict[years[1]] = yearRange['interestRate']
            interest = 0
            pfYear = ""
            insertionTupleList = []
            totalContribution = 0
            for index, pf in enumerate(pfRows):
                pfSplit = pf[0].split('-')
                pfYear = pfSplit[1]
                totalContribution += pf[2] + pf[3]
                if pfSplit[0] == "Apr" and interest != 0:
                    totalContribution += interest
                    self.insertPFInterest((f"{int(pfYear) - 1}-{pfYear}", interest))
                    interest = 0
                    logging.info(f"Inserting Pf Interest for year {int(pfYear) - 1}-{pfYear}")
                pfTupleInList = list(pf)
                pfTupleInList.append(totalContribution)
                if index != 0:
                    interest += ((float(interestDict[pfYear]) / 1200) * float(totalContribution))
                insertionTupleList.append(tuple(pfTupleInList))
            if interest != 0:
                self.insertPFInterest((f"{int(pfYear) - 1}-{pfYear}**", interest))
            logging.info("Finished recalculation and reinsertion of pf Values and interest")
            return self.insertPF(insertionTupleList)
        except Exception as ex:
            logging.error(f"Error while recalculating pf. {ex}")
            self._dbConnection.rollback()
            return False
        finally:
            self._dbConnection.commit()
