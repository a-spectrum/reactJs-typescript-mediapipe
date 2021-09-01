import React, {Ref, useEffect, useState} from "react";
import Webcam from "react-webcam";
import {Camera} from '@mediapipe/camera_utils'
import {HAND_CONNECTIONS, Handedness, Hands} from '@mediapipe/hands'
import {drawConnectors, drawLandmarks, lerp, NormalizedLandmarkList} from '@mediapipe/drawing_utils'

export enum fingerEnum {
    THUMB_TIP = 4,
    INDEX_FINGER_TIP = 8,
    MIDDLE_FINGER_TIP = 12,
    RING_FINGER_TIP = 16,
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
    const handsMirrored = true;
    const testDivIndexRef = React.useRef<HTMLDivElement>(null);
    const testDivThumbRef = React.useRef<HTMLDivElement>(null);
    const [indexDivColour, setIndexDivColour] = useState('blue');
    const [thumbDivColour, setThumbDivColour] = useState('blue');
    const [indexDivBorderRadius, setIndexDivBorderRadius] = useState('50%');
    const [thumbDivBorderRadius, setThumbDivBorderRadius] = useState('50%');

    const webcamRef = React.useRef<Webcam>(null);
    const canvasReference = React.useRef<HTMLCanvasElement>(null);
    const [indexCoordinate, setIndexCoordinate] = useState({x: 0, y: 0, z: 0});
    const [indexLocation, setIndexLocation] = useState({top: 0, bottom: 0, left: 0, right: 0});
    const [thumbCoordinate, setThumbCoordinate] = useState({x: 0, y: 0, z: 0});
    let canvasCtx: any;
    let camera: Camera;

    const between = (x: number, min: number, max: number) => {
        return x >= min && x <= max;
    }
    const getElementCoordinates = (element: React.RefObject<HTMLDivElement>) => {
        let coordinates = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        };
        if (element.current) {
            const offsets = element.current.getBoundingClientRect();
            setIndexLocation({
                top: offsets.top,
                bottom: offsets.bottom,
                left: offsets.left,
                right: offsets.right
            });

            coordinates.top = offsets.top;
            coordinates.bottom = offsets.bottom;
            coordinates.left = offsets.left;
            coordinates.right = offsets.right;
            };

        return coordinates;

    }

    const calculateCoordinate = (landmarks: Array<object>, finger: fingerEnum) => {
        let fingerCoordinate: fingerCoordinate;
        switch (finger) {
            case fingerEnum.PINKY_TIP:
                fingerCoordinate = landmarks[fingerEnum.PINKY_TIP] as fingerCoordinate;
                break;
            case fingerEnum.RING_FINGER_TIP:
                fingerCoordinate = landmarks[fingerEnum.RING_FINGER_TIP] as fingerCoordinate;
                break;
            case fingerEnum.MIDDLE_FINGER_TIP:
                fingerCoordinate = landmarks[fingerEnum.MIDDLE_FINGER_TIP] as fingerCoordinate;
                break;
            case fingerEnum.INDEX_FINGER_TIP:
                fingerCoordinate = landmarks[fingerEnum.INDEX_FINGER_TIP] as fingerCoordinate;
                break;
            case fingerEnum.THUMB_TIP:
                fingerCoordinate = landmarks[fingerEnum.THUMB_TIP] as fingerCoordinate;
                break;
        }
        return {
            x: fingerCoordinate.x * window.innerWidth,
            y: fingerCoordinate.y * window.innerHeight,
        };
    }
    const isElementTouchedByFinger = (element: React.RefObject<HTMLDivElement>, landmarks: Array<Array<object>>, finger: fingerEnum) => {
        // Get coordinates of element
        let touched = false;
        const elementCoordinates: { top: number; left: number; bottom: number; right: number } = getElementCoordinates(element);

        for (let index = 0; index < landmarks.length; index++) {
            // Get coordinates of finger tip of specific finger.
            const landmarkCoordinates: { x: number; y: number } = calculateCoordinate(landmarks[index], finger);
            touched === false && (touched =
                    (
                        between(landmarkCoordinates.x, elementCoordinates.left, elementCoordinates.right)
                        &&
                        between(landmarkCoordinates.y, elementCoordinates.top, elementCoordinates.bottom)
                    )
            );
        }

        switch (finger) {
            case fingerEnum.INDEX_FINGER_TIP:
                setIndexDivColour(touched ? 'green' : 'blue');
                setIndexDivBorderRadius(touched ? '50px' : '50%');
                break;
            case fingerEnum.THUMB_TIP:
                setThumbDivColour(touched ? 'green' : 'blue');
                setThumbDivBorderRadius(touched ? '50px' : '50%');
                break;
            default:
                break;
        }
    }

    const renderIndexDiv = () => {
        return <div
            ref={testDivIndexRef}
            style={{
                gridColumn: 2,
                height: 200,
                width: 200,
                borderRadius: indexDivBorderRadius,
                backgroundColor: indexDivColour,
                transitionProperty: 'border-radius, background-color',
                transition: '0.3s ease-in-out',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <h3
                style={{
                    padding: 16,
                    backgroundColor: 'white',
                    borderRadius: 10,
                }}
            >Index finger</h3>
        </div>
    }
    const renderThumbDiv = () => {
        return <div
            ref={testDivThumbRef}
            style={{
                gridColumn: 4,
                height: 200,
                width: 200,
                borderRadius: thumbDivBorderRadius,
                backgroundColor: thumbDivColour,
                transitionProperty: 'border-radius, background-color',
                transition: '0.3s ease-in-out',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <h3
                style={{
                    padding: 16,
                    backgroundColor: 'white',
                    borderRadius: 10,
                }}
            >Thumb</h3>
        </div>
    }

    const onResults = (results: { multiHandLandmarks?: NormalizedLandmarkList[] | undefined; multiHandedness?: Handedness[] | undefined; }) => {
        // console.log(results)

        canvasReference.current && (canvasCtx = canvasReference.current.getContext('2d'));
        if(canvasCtx) {
            webcamRef.current && webcamRef.current.video && (canvasCtx.width = webcamRef.current.video.videoWidth);
            webcamRef.current && webcamRef.current.video && (canvasCtx.height = webcamRef.current.video.videoHeight);
            canvasCtx.save();
            canvasReference.current && canvasCtx.clearRect(0, 0, canvasReference.current.width, canvasReference.current.height);
            // Webcam feed again
            // canvasCtx.drawImage(results.image, 0, 0, canvasReference.current.width, canvasReference.current.height);

            canvasCtx.fillStyle = "black";
            canvasCtx.fillRect(0, 0, canvasCtx.width, canvasCtx.height);
            let fingerCoordinatesList: Array<Array<object>> = [];

            if (results.multiHandLandmarks && results.multiHandedness) {
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

                    fingerCoordinatesList.push(landmarks);
                }

                if (fingerCoordinatesList.length > 0) {
                    isElementTouchedByFinger(testDivIndexRef, fingerCoordinatesList, fingerEnum.INDEX_FINGER_TIP);
                    isElementTouchedByFinger(testDivThumbRef, fingerCoordinatesList, fingerEnum.THUMB_TIP);
                }

            }
            canvasCtx.restore();
        }
    }

    useEffect(() => {
        const hands = new Hands({
            locateFile: (file: string) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            },
        });
        hands.setOptions({
            selfieMode: handsMirrored,
            maxNumHands: 2,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });
        hands.onResults(onResults);

        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null
        ) {
            // @ts-ignore
            camera = new Camera(webcamRef.current.video, {
                onFrame: async () => {
                    // @ts-ignore
                    webcamRef.current && await hands.send({image: webcamRef.current.video});
                },
                width: 1280,
                height: 720,
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
                {renderIndexDiv()}
                {renderThumbDiv()}
            </div>
            <h1>Index coordinate:
                x {indexCoordinate.x * window.innerWidth} y {indexCoordinate.y * window.innerHeight}</h1>
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
