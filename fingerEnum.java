import React, {useEffect, useState} from "react";
import Webcam from "react-webcam";
import {Camera} from '@mediapipe/camera_utils';
import {HAND_CONNECTIONS, Handedness, Hands} from '@mediapipe/hands';
import {drawConnectors, drawLandmarks, lerp, NormalizedLandmarkList} from '@mediapipe/drawing_utils';
import * as Tone from 'tone';
import { Sequence } from "tone";

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

    const testDivIndexRef = React.useRef<HTMLDivElement>(null);
    const [indexDivColour, setIndexDivColour] = useState('blue');
    const [indexDivBorderRadius, setIndexDivBorderRadius] = useState('50%');

    const testDivThumbRef = React.useRef<HTMLDivElement>(null);
    const [thumbDivColour, setThumbDivColour] = useState('blue');
    const [thumbDivBorderRadius, setThumbDivBorderRadius] = useState('50%');

    const webcamRef = React.useRef<Webcam>(null);
    const canvasReference = React.useRef<HTMLCanvasElement>(null);
    // const [indexCoordinate, setIndexCoordinate] = useState({x: 0, y: 0, z: 0});
    // const [indexLocation, setIndexLocation] = useState({top: 0, bottom: 0, left: 0, right: 0});
    // const [thumbCoordinate, setThumbCoordinate] = useState({x: 0, y: 0, z: 0});
    let canvasCtx: any;
    let camera: Camera;
    let hands: Hands;
    // let fingerCoordinatesList: Array<Array<object>> = [];

    let timeMilliseconds = Date.now();

    const [detectableElements, setDetectableElements] = useState<Array<any>>([]);
    const [fingerCoordinatesList, setfingerCoordinatesList] = useState<{
        multiHandLandmarks?: NormalizedLandmarkList[]
            | undefined; multiHandedness?: Handedness[] | undefined;
    }>();
    const [touchedElements, setTouchedElements] = useState<Array<string>>([]);

    useEffect(() => {
        console.log(touchedElements);
    }, [touchedElements])

    useEffect(() => {
        // console.log(fingerCoordinatesList);
        if (fingerCoordinatesList && fingerCoordinatesList.multiHandLandmarks) {
            isElementTouchedByFinger(testDivIndexRef, fingerCoordinatesList.multiHandLandmarks, fingerEnum.INDEX_FINGER_TIP);
            isElementTouchedByFinger(testDivThumbRef, fingerCoordinatesList.multiHandLandmarks, fingerEnum.THUMB_TIP);
            // for (let index = 0; index < fingerCoordinatesList.multiHandLandmarks.length; index++) {
            //     // console.log(fingerCoordinatesList.multiHandLandmarks[index]);
            // }
        }
    }, [fingerCoordinatesList])

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
            // setIndexLocation({
            //     top: offsets.top,
            //     bottom: offsets.bottom,
            //     left: offsets.left,
            //     right: offsets.right
            // });

            coordinates.top = offsets.top;
            coordinates.bottom = offsets.bottom;
            coordinates.left = offsets.left;
            coordinates.right = offsets.right;
        }
        ;

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
            // @ts-ignore
            x: fingerCoordinate.x * window.innerWidth,
            // @ts-ignore
            y: fingerCoordinate.y * window.innerHeight,
        };
    }

    const map = (value: number, x1: number, y1: number, x2: number, y2: number) => (value - x1) * (y2-x2) / (y1 - x1) + x2;
    const positionToNote = (position:number) => {
        // convert location / coordinate between 0 and 1 to note
        let frequency = map(position, 0, 1, 1600, 0);
        return Tone.Frequency(frequency, 'hz').toNote().replace('#', '');
    }

    const isElementTouchedByFinger = (element: React.RefObject<HTMLDivElement>, landmarks: Array<Array<object>>, finger: fingerEnum) => {
        /*
            This functions checks for the given elements if
            the given coordinate of the finger touched the
            element by extracting it from the langsmarks.
            After which the coordinate from the landmark and
            element are compared.

            Followed by this determination of being touched the
            element belonging to the finger is activated.
        */

        // Get coordinates of element
        let touched = false;
        const elementCoordinates: { top: number; left: number; bottom: number; right: number } = getElementCoordinates(element);

        // for each hand
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

        // console.log(touchedElements);
        if (element.current && touched) {
            // If element has activated
            if (touchedElements.includes(element.current.id)) {
            }
            // if element has not yet activated
            else {
                let elementToAdd: string = element.current.id;
                elementToAdd.length > 0 && setTouchedElements(touchedElement => touchedElement.concat([elementToAdd]));
                console.log('play note');
                switch (finger) {
                    case fingerEnum.INDEX_FINGER_TIP:
                        setIndexDivColour(touched ? 'green' : 'blue');
                        setIndexDivBorderRadius(touched ? '50px' : '50%');
                        synth.triggerAttackRelease(positionToNote(0.5), 500);
                        break;
                    case fingerEnum.THUMB_TIP:
                        setThumbDivColour(touched ? 'green' : 'blue');
                        setThumbDivBorderRadius(touched ? '50px' : '50%');
                        synth2.triggerAttackRelease("F4", "8n");
                        break;
                    default:
                        break;
                }
            }
        } else if (element.current && !touched) {
            // Element needs to be deactivated
            if (touchedElements.includes(element.current.id)) {
                let elementToRemove: string = element.current.id;
                elementToRemove.length > 0 && setTouchedElements(touchedElement =>
                    touchedElement.filter(touchedElement => touchedElement !== elementToRemove)
                );
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
            // if element does not need to be deactivated
            else {

            }
        }


    }

    const renderIndexDiv = () => {
        return <div
            id={'EL-1'}
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
            id={'EL-2'}
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

    const isElementTouched = (landmarks: Array<Array<object>>, registeredElements: any) => {
        console.log(registeredElements);
        if (registeredElements.length > 0) {
            // let touched = false;

            let tempCoordinate = landmarks[0][fingerEnum.INDEX_FINGER_TIP];
            // let indexCoordinate: fingerCoordinate = {
            //     x: tempCoordinate.x * window.innerWidth,
            //     y: tempCoordinate.y * window.innerHeight,
            //     z: 0};
            console.log(tempCoordinate)

            // filter with filter()
            // const toTheRight = detectableElements.filter(indexCoordinate.x > detectableElement.coordinates.left);

            // for (let index = 0; index < landmarks.length; index++) {
            //     // Get coordinates of finger tip of specific finger.
            //     const landmarkCoordinates: { x: number; y: number } = calculateCoordinate(landmarks[index], finger);
            //     touched === false && (touched =
            //             (
            //                 between(landmarkCoordinates.x, elementCoordinates.left, elementCoordinates.right)
            //                 &&
            //                 between(landmarkCoordinates.y, elementCoordinates.top, elementCoordinates.bottom)
            //             )
            //     );
            // }
        }

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

                    // fingerCoordinatesList.push(landmarks);
                }

                // Check for each coordinate if there is an overlap with the given element.
                // if (fingerCoordinatesList.length > 0) {
                //     isElementTouchedByFinger(testDivIndexRef, fingerCoordinatesList, fingerEnum.INDEX_FINGER_TIP);
                //     isElementTouchedByFinger(testDivThumbRef, fingerCoordinatesList, fingerEnum.THUMB_TIP);
                //     // console.log(fingerCoordinatesList[8]);
                //     // isElementTouched(fingerCoordinatesList, detectableElements);
                // }
                //
                // fingerCoordinatesList = [];

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
                    let timePassed = false;
                    Date.now() - 500 > timeMilliseconds && (timePassed = true);
                    timePassed && (timeMilliseconds = Date.now());
                    timePassed && webcamRef.current && webcamRef.current.video && await hands.send({image: webcamRef.current.video});
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
                {/*<InteractiveElement*/}
                {/*    UID={'hihi'}*/}
                {/*    detectableElements={detectableElements}*/}
                {/*    setDetectableElements={setDetectableElements}*/}
                {/*/>*/}
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
