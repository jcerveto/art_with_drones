from flask import Flask, jsonify, request

import src.drone.droneEntity as droneEntity
import src.security as security

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify({
        "ok": True,
        "message": "Home page"
    })


@app.route("/register", methods=['POST'])
def register():
    try:
        print("request: ", request, request.args)
        drone_obj = droneEntity.DroneEntity(
            id=int(request.args.get("id")),
            alias=request.args.get("alias")
        )
        print("drone_obj: ", drone_obj)
        if drone_obj.id is None or drone_obj.alias is None or drone_obj.id == '' or drone_obj.alias == '':
            raise Exception(f"Invalid data: {request}")

        password = drone_obj.create()
        temp_token: str = security.generate_temporal_token(int(request.args.get("id")), 0)

        if password == '':
            raise Exception(f"Drone {drone_obj.id} already exists. We can not create it again.")

        return jsonify({
            "ok": True,
            "message": f"Drone {drone_obj.id} created",
            "password": password,
            "token": temp_token
        })
    except Exception as e:
        return jsonify({
            "ok": False,
            "message": str(e)
        })


@app.route("/update", methods=['PATCH'])
def update():
    try:
        print("request: ", request, request.args)
        drone_obj = droneEntity.DroneEntity(
            id=int(request.args.get("id")),
            alias=request.args.get("alias"),
            token=request.args.get("token")
        )
        print("drone_obj: ", drone_obj)
        if (drone_obj.id is None or drone_obj.alias is None or drone_obj.token is None
                or drone_obj.id == '' or drone_obj.alias == '' or drone_obj.token == ''):
            raise Exception(f"Invalid data: {request}")

        drone_obj.update()

        return jsonify({
            "ok": True,
            "message": f"Drone {drone_obj.id} updated",
        })
    except Exception as e:
        return jsonify({
            "ok": False,
            "message": str(e)
        })


@app.route("/login", methods=['GET'])
def login():
    try:
        print("request: ", request, request.args)
        drone_obj = droneEntity.DroneEntity(
            id=int(request.args.get("id")),
            token=request.args.get("token"),
        )
        print("drone_obj: ", drone_obj)
        if drone_obj.id is None or drone_obj.alias is None or drone_obj.id == '' or drone_obj.alias == '':
            raise Exception(f"Invalid data: {request}")

        if not drone_obj.exists():
            raise Exception(f"Drone {drone_obj.id} does not exist. We can not generate a token. ")

        temp_token: str = security.generate_temporal_token(
            int(request.args.get("id")),
            str(request.args.get("public_key"))
        )

        return jsonify({
            "ok": True,
            "message": f"Drone {drone_obj.id} updated",
            "password": drone_obj.token,
            "token": temp_token
        })
    except Exception as e:
        return jsonify({
            "ok": False,
            "message": str(e)
        })


@app.route("/delete", methods=['DELETE'])
def delete():
    try:
        print("request: ", request, request.args)
        drone_obj = droneEntity.DroneEntity(
            id=int(request.args.get("id")),
            alias=request.args.get("alias"),
            token=request.args.get("token")
        )
        print("drone_obj: ", drone_obj)
        if drone_obj.id is None or drone_obj.alias is None or drone_obj.id == '' or drone_obj.alias == '':
            raise Exception(f"Invalid data: {request}")

        drone_obj.delete()

        return jsonify({
            "ok": True,
            "message": f"Drone {drone_obj.id} deleted"
        })
    except Exception as e:
        return jsonify({
            "ok": False,
            "message": str(e)
        })


if __name__ == "__main__":
    app.run(debug=True, port=6001, host='0.0.0.0')
