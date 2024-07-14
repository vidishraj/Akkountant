from flask import request, jsonify
from util.logger import logging
from util.dbConnector import Config


def requestInterceptor():
    try:
        authorizationValue = request.headers.get("Authorization")
        if authorizationValue is not None:
            if Config['api_key'] != authorizationValue:
                logging.error(f"Unauthorized request. Rejecting it. Headers are:\n{request.headers}")
                return jsonify({"Error": "Unauthorized"}), 403
        else:
            return jsonify({"Error": "Missing data"}), 406
    except Exception as ex:
        logging.error(f"Error while intercepting request.{ex}")
        return jsonify({"Error": "Server error"}), 500
