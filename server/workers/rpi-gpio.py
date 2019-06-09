import RPi.GPIO as GPIO
from time import sleep
from datetime import datetime
import logging
import threading
import signal
import sys
import json
from os import path

dir_path = path.dirname(path.dirname(path.realpath(__file__)))
data_path = (path.join(dir_path,"data"))

BACKYARD_GPIO = 13
FRONTYARD_GPIO = 6
WATERING_TIME_LIMIT = 30
wateringSystemActivityFilename = path.join(data_path,"water-activity-logs.log")
#Change waterStatusFile name and seperate path from actual filename
waterStatusFileName = path.join(data_path,"water-status.json")
waterStatus = {}
LOGGER_FORMAT="%(asctime)s - %(levelname)-8s - %(message)s"

print("\n==========================================\n\n")
print("Please pass either 'activate' to activate the relay or anything else to deactivate it")
print("Syntax: python rpi-gpio.py <activate|deactivate> <backyard|frontyard|both> <time(seconds)>")
print("\n\n==========================================\n")

def setup():
	GPIO.setmode(GPIO.BCM)
	GPIO.setwarnings(False) 
	GPIO.setup(BACKYARD_GPIO, GPIO.OUT)
	GPIO.setup(FRONTYARD_GPIO, GPIO.OUT)
	logging.basicConfig(filename=wateringSystemActivityFilename, level=logging.DEBUG, format=LOGGER_FORMAT)

def relay(activate=1, zone=""):
	if activate == 0 and zone == "both":
		GPIO.output(BACKYARD_GPIO, GPIO.HIGH)
		GPIO.output(FRONTYARD_GPIO, GPIO.HIGH)
		logActivity("Deactivating Relay, zone: " + zone)
	elif activate == 1 and zone == "both":
		GPIO.output(BACKYARD_GPIO, GPIO.LOW)
		GPIO.output(FRONTYARD_GPIO, GPIO.LOW)
		logActivity("Activating Relay, zone: " + zone)
	elif activate == 0 and zone == "backyard":
		GPIO.output(BACKYARD_GPIO, GPIO.HIGH)
		logActivity("Deactivating Relay, zone: " + zone)
	elif activate == 1 and zone == "backyard":
		GPIO.output(BACKYARD_GPIO, GPIO.LOW)
		logActivity("Activating Relay, zone: " + zone)
	elif activate == 0 and zone == "frontyard":
		GPIO.output(FRONTYARD_GPIO, GPIO.HIGH)
		logActivity("Deactivating Relay, zone: " + zone)
	elif activate == 1 and zone == "frontyard":
		GPIO.output(FRONTYARD_GPIO, GPIO.LOW)
		logActivity("Activating Relay, zone: " + zone)
	
	logWateringSystemActivity()


#Because the relay is active low, 1 is OFF and 0 is ON
def isBackyardActive():
	#print("Backyard is inactive" if GPIO.input(BACKYARD_GPIO) == True else "Backyard is active")
	waterStatus['backyard'] = "inactive" if GPIO.input(BACKYARD_GPIO) == True else "active"

def isFrontyardActive():
	#print("Frontyard is inactive" if GPIO.input(FRONTYARD_GPIO) == True else "Frontyard is active")
	waterStatus['frontyard'] = "inactive" if GPIO.input(FRONTYARD_GPIO) == True else "active"

def logWateringSystemActivity():
	isBackyardActive()
	isFrontyardActive()
	with open(waterStatusFileName, "w+") as f:
		print(waterStatus)
		json.dump(waterStatus, f)

def logActivity(msg):
	print(msg)
	logging.info(msg)

def cleanExit(sig, frame):
	print('Exiting RPI Program...')
	GPIO.cleanup()
	print('GPIO Pins CLEANUP DONE')
	sys.exit(0)

signal.signal(signal.SIGINT, cleanExit)

if len(sys.argv) <= 1: 
	print("Please supply the correct syntax")
	sys.exit(0)

try:
	setup()

	command = sys.argv[1]
	zone = ""
	time = 0
	if len(sys.argv) == 4:
		time = int(sys.argv[3])
		zone = sys.argv[2]

	if len(sys.argv) == 3:
		zone = sys.argv[2]

	if command == "status":
		logWateringSystemActivity()
		sys.exit(0)

	if command == "activate" and time > 0 and time <= WATERING_TIME_LIMIT:
		if zone != "both" and zone != "backyard" and zone != "frontyard":
			print("Please supply the correct syntax. The zone is incorrect.")
			sys.exit(0)
		print("Activating Relay...")
		relay(activate=1, zone=zone)
		time = time * 60 #threading.timer takes seconds so we pass seconds * 60 to have minutes
		print("Activated for: " + str(time/60) + " minutes")
		t = threading.Timer(time, relay, [0, zone])
		t.start()
	elif time <= 0 or time > WATERING_TIME_LIMIT:
		print("The watering system can only be activate for " + str(WATERING_TIME_LIMIT) + " minutes at a time!")

	if command == "deactivate":
		if zone != "both" and zone != "backyard" and zone != "frontyard":
			print("ERROR: Please supply the correct syntax. The zone is incorrect.")
			sys.exit(0)
		print("Deactivating Relay...")
		relay(activate=0, zone=zone)
		print("Deactivated")

except KeyboardInterrupt:
	print("Oho!")
	
