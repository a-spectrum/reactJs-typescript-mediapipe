import React, {useEffect, useState} from "react";
import Webcam from "react-webcam";
import {Camera} from '@mediapipe/camera_utils';
import {HAND_CONNECTIONS, Handedness, Hands} from '@mediapipe/hands';
import {drawConnectors, drawLandmarks, lerp, NormalizedLandmarkList} from '@mediapipe/drawing_utils';
import * as Tone from 'tone';

export enum fingerEnum {
    WRIST = 0,
    THUMB_CMC_LOWEST = 1,
    THUMB_MCP = 2,
    THUMB_IP = 3,
    THUMB_TIP = 4,
    INDEX_FINGER_MCP = 5,
    INDEX_FINGER_PIP = 6,
    INDEX_FINGER_DIP = 7,
    INDEX_FINGER_TIP = 8,
    MIDDLE_FINGER_MCP = 9,
    MIDDLE_FINGER_PIP = 10,
    MIDDLE_FINGER_DIP = 11,
    MIDDLE_FINGER_TIP = 12,
    RING_FINGER_MCP = 13,
    RING_FINGER_PIP = 14,
    RING_FINGER_DIP = 15,
    RING_FINGER_TIP = 16,
    PINKY_MCP = 17,
    PINKY_PIP = 18,
    PINKY_DIP = 19,
    PINKY_TIP = 20,
}

interface fingerCoordinate {
    x: number;
    y: number;
    z: number;
}

const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
};

function HandDetection() {
    const synth = new Tone.Synth().toDestination();
    const synth2 = new Tone.Synth().toDestination();
    const MEDIAPIPE_HANDS_VERSION_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.3.1620248595/';
    const handsMirrored = true;

    const webcamRef = React.useRef<Webcam>(null);
    const canvasReference = React.useRef<HTMLCanvasElement>(null);
    let canvasCtx: any;
    let camera: Camera;
    let hands: Hands;

    let timeMilliseconds = Date.now();

    const [fingerCoordinatesList, setfingerCoordinatesList] = useState<{
        multiHandLandmarks?: NormalizedLandmarkList[]
            | undefined; multiHandedness?: Handedness[]
            | undefined;
    }>();

    // const map = (value: number, x1: number, y1: number, x2: number, y2: number) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;
    // const positionToNote = (position: number) => {
    //     // convert location / coordinate between 0 and 1 to note
    //     let frequency = map(position, 0, 1, 1600, 0);
    //     return Tone.Frequency(frequency, 'hz').toNote().replace('#', '');
    // }
    //
    // let start: number, previousTimeStamp: number;
    // const startAnimation = (timestamp: number) => {
    //     setTimeout(() => {
    //         synth.triggerAttackRelease('D4', 50, Tone.now());
    //         window.requestAnimationFrame(startAnimation);
    //     }, 100)
    // }
    //
    // useEffect(() => {
    //     window.requestAnimationFrame(startAnimation);
    // }, [])

    useEffect(() => {
        if (fingerCoordinatesList && fingerCoordinatesList.multiHandLandmarks) {

        }
    }, [fingerCoordinatesList])

    const between = (x: number, min: number, max: number) => {
        return x >= min && x <= max;
    }

    const onResults = (results: { multiHandLandmarks?: NormalizedLandmarkList[] | undefined; multiHandedness?: Handedness[] | undefined; }) => {
        // Get the canvas reference, if it exists put it in canvasCtx
        canvasReference.current && (canvasCtx = canvasReference.current.getContext('2d'));

        if (canvasCtx) {
            // Set canvas height & width to equal the video height & width in case of screen resizing
            webcamRef.current && webcamRef.current.video && (canvasCtx.width = webcamRef.current.video.videoWidth);
            webcamRef.current && webcamRef.current.video && (canvasCtx.height = webcamRef.current.video.videoHeight);
            canvasCtx.save();
            canvasReference.current && canvasCtx.clearRect(0, 0, canvasReference.current.width, canvasReference.current.height);

            // Webcam feed again
            // canvasCtx.drawImage(results.image, 0, 0, canvasReference.current.width, canvasReference.current.height);

            canvasCtx.fillStyle = "black";
            canvasCtx.fillRect(0, 0, canvasCtx.width, canvasCtx.height);

            if (results.multiHandLandmarks && results.multiHandedness) {
                // Get all the coordinates of the hand(s) in a for loop
                // TODO - Change to array helper for faster result
                setfingerCoordinatesList(results);

                for (let index = 0; index < results.multiHandLandmarks.length; index++) {
                    const classification = results.multiHandedness[index];
                    const isRightHand = classification.label === 'Right';
                    const landmarks = results.multiHandLandmarks[index];

                    drawConnectors(
                        canvasCtx, landmarks, HAND_CONNECTIONS,
                        {color: isRightHand ? '#00FF00' : '#FF0000'});

                    drawLandmarks(canvasCtx, landmarks, {
                        color: isRightHand ? '#00FF00' : '#FF0000',
                        fillColor: isRightHand ? '#FF0000' : '#00FF00',
                        radius: (x) => {
                            // @ts-ignore
                            return lerp(x.from?.z, -0.15, .1, 1, 1);
                        }
                    });
                }
            }
            canvasCtx.restore();
        }
    }

    useEffect(() => {
        // Create new Hands object to place in variable
        hands = new Hands({
            locateFile: (file: string) => {
                return MEDIAPIPE_HANDS_VERSION_URL + `${file}`;
            },
        });
        hands.setOptions({
            selfieMode: handsMirrored,
            maxNumHands: 2,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });
        // Determine what has to be done if a hand is detected
        hands.onResults(onResults);

        // Setup webcam
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null
        ) {
            // @ts-ignore
            camera = new Camera(webcamRef.current.video, {

                onFrame: async () => {
                    // Every frame send the frame to hands so onResults can be triggered if a hand is detected in the frame
                    // let timePassed = false;
                    // Date.now() - 100 > timeMilliseconds && (timePassed = true);
                    // timePassed && (timeMilliseconds = Date.now());
                    webcamRef.current && webcamRef.current.video && await hands.send({image: webcamRef.current.video});
                },
                width: 1280,
                height: 720
            });

            camera.start().then();
        }
    }, []);

    return (
        <div className="App">
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    width: '100%',
                    position: 'absolute',
                    top: 200,
                    zIndex: 29,
                }}
            >
            </div>
            {/*<h1>Index coordinate:*/}
            {/*    x {indexCoordinate.x * window.innerWidth} y {indexCoordinate.y * window.innerHeight}</h1>*/}
            <Webcam
                audio={false}
                height={720}
                ref={webcamRef}
                mirrored={true}
                screenshotFormat="image/jpeg"
                width={1280}
                videoConstraints={videoConstraints}
                onUserMedia={() => {
                    // console.log('webcamRef.current', webcamRef.current);
                    // navigator.mediaDevices
                    //   .getUserMedia({ video: true })
                    //   .then(stream => webcamRef.current.srcObject = stream)
                    //   .catch(console.log);

                    // setCameraReady(true)
                }}
            />
            <canvas
                ref={canvasReference}
                style={{
                    position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    top: 0,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    zIndex: 9,
                    width: window.innerWidth,
                    height: window.innerHeight,
                }}
            />
        </div>
    );
}

export default HandDetection;
