import React, {useEffect, useState} from "react";
import Webcam from "react-webcam";
import {Camera} from '@mediapipe/camera_utils'
import {HAND_CONNECTIONS, Handedness, Hands} from '@mediapipe/hands'
import {drawConnectors, NormalizedLandmarkList} from '@mediapipe/drawing_utils'
import {Feedback} from "../Feedback/Feedback";
import LoadingSpinner from "../LoadingSpinner";

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
    visibility: any;
}

interface detectedElement {
    elementId: string;
    left: number;
    top: number;
    right: number;
    bottom: number;
    timestampTouched: number;
    timeElapsed: number;
    clicked: boolean;
}

const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
};

function HandDetection() {
    const handsMirrored = true;
    let timeMilliseconds = Date.now();
    let timeMillisecondsResetTimer = Date.now();
    // const testDivIndexRef = React.useRef<HTMLDivElement>(null);
    // const testDivThumbRef = React.useRef<HTMLDivElement>(null);
    // const [indexDivColour, setIndexDivColour] = useState('blue');
    // const [thumbDivColour, setThumbDivColour] = useState('blue');
    // const [indexDivBorderRadius, setIndexDivBorderRadius] = useState('50%');
    // const [thumbDivBorderRadius, setThumbDivBorderRadius] = useState('50%');

    const webcamRef = React.useRef<Webcam>(null);
    const canvasReference = React.useRef<HTMLCanvasElement>(null);
    // const [indexCoordinate, setIndexCoordinate] = useState({x: 0, y: 0, z: 0});
    // const [indexLocation, setIndexLocation] = useState({top: 0, bottom: 0, left: 0, right: 0});
    // const [thumbCoordinate, setThumbCoordinate] = useState({x: 0, y: 0, z: 0});
    let canvasCtx: any;
    let camera: Camera;
    let hands: Hands;

    // For feedback element
    const [showHovering, setShowHovering] = useState<boolean>(false);
    const [storeTime, setStoreTime] = useState<number>(0);
    const [indexCoordinates, setIndexCoordinates] = useState<fingerCoordinate>({
        x: 0,
        y: 0,
        z: 0,
        visibility: false,
    });

    // For detecting elements and providing locations
    const [detectableElements, setDetectableElements] = useState<Array<detectedElement>>([]);
    const [touchedElements, setTouchedElements] = useState<Array<detectedElement>>([]);
    const [handCoordinates, setHandCoordinates] = useState<{ multiHandLandmarks?: NormalizedLandmarkList[] | undefined; multiHandedness?: Handedness[] | undefined; }>();
    const [dimensions, setDimensions] = React.useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    // Check if model has loaded
    const [modelStillLoading, setModelStillLoading] = useState<boolean>(true);
    const [gameNotFinishedStore, setGameNotFinishedStore] = useState<boolean>(true);
    const [countdownWidth, setCountdownWidth] = useState<number>(500);

    useEffect(() => {
        // @ts-ignore
        !modelStillLoading && document.getElementById('root')
            .setAttribute('data-modelStarted', 'true');
        !modelStillLoading && clickElement('game-board-container');

        setTimeout(() => {
            findInteractiveElements();
        }, 100)
    }, [modelStillLoading])

    const handleResize = () => {
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }

    useEffect(() => {
        findInteractiveElements();
    }, [dimensions])

    useEffect(() => {

        touchedElements.length > 0
        && touchedElements[0].clicked === false
            ? setShowHovering(true) : setShowHovering(false);

    }, [touchedElements])

    useEffect(() => {
        // console.log(handCoordinates);
        if (handCoordinates && handCoordinates.multiHandLandmarks) {
            checkIfElementTouchedByIndex(handCoordinates.multiHandLandmarks);
        }
    }, [handCoordinates])

    const setTilesToClicked = () => {
        touchedElements.forEach(touchedEl => {
            touchedEl.elementId.substr(0, 4) === 'tile' && (touchedEl.clicked = true);
            // console.log(touchedEl);
        })
    }

    const findInteractiveElements = () => {
        setDetectableElements([]);

        for (let index = 0; index < 9; index++) {
            let element: HTMLElement | null = document.getElementById('tile-' + index);
            let elementBounding = element?.getBoundingClientRect();

            element && setDetectableElements(detectableElement =>
                detectableElement.concat([{
                    elementId: element?.id,
                    left: elementBounding?.left,
                    top: elementBounding?.top,
                    right: elementBounding?.right,
                    bottom: elementBounding?.bottom,
                    timestampTouched: 0,
                    timeElapsed: 0,
                    clicked: false,
                } as detectedElement]))
        }

        let gamemodeButton1: HTMLElement | null = document.getElementById('gamemodebutton1');
        let gamemodeButton1Bounding = gamemodeButton1?.getBoundingClientRect();
        let gamemodeButton2: HTMLElement | null = document.getElementById('gamemodebutton2');
        let gamemodeButton2Bounding = gamemodeButton2?.getBoundingClientRect();
        gamemodeButton1 && setDetectableElements(detectableElement =>
            detectableElement.concat([{
                elementId: gamemodeButton1?.id,
                left: gamemodeButton1Bounding?.left,
                top: gamemodeButton1Bounding?.top,
                right: gamemodeButton1Bounding?.right,
                bottom: gamemodeButton1Bounding?.bottom,
                timestampTouched: 0,
                timeElapsed: 0,
                clicked: false,
            } as detectedElement]))
        gamemodeButton2 && setDetectableElements(detectableElement =>
            detectableElement.concat([{
                elementId: gamemodeButton2?.id,
                left: gamemodeButton2Bounding?.left,
                top: gamemodeButton2Bounding?.top,
                right: gamemodeButton2Bounding?.right,
                bottom: gamemodeButton2Bounding?.bottom,
                timestampTouched: 0,
                timeElapsed: 0,
                clicked: false,
            } as detectedElement]))
    }

    const between = (x: number, min: number, max: number) => {
        return x >= min && x <= max;
    }
    const startHover = (elementId: string) => {
        const mouseoverEvent = new Event('mouseenter');
        document.getElementById(elementId)?.dispatchEvent(mouseoverEvent);
    }
    const endHover = (elementId: string) => {
        const mouseoverEvent = new Event('mouseleave');
        document.getElementById(elementId)?.dispatchEvent(mouseoverEvent);
    }
    const clickElement = (elementId: string) => {
        document.getElementById(elementId)?.click();
    }

    // const getElementCoordinates = (element: React.RefObject<HTMLDivElement>) => {
    //     let coordinates = {
    //         top: 0,
    //         bottom: 0,
    //         left: 0,
    //         right: 0,
    //     };
    //     if (element.current) {
    //         const offsets = element.current.getBoundingClientRect();
    //         setIndexLocation({
    //             top: offsets.top,
    //             bottom: offsets.bottom,
    //             left: offsets.left,
    //             right: offsets.right
    //         });
    //
    //         coordinates.top = offsets.top;
    //         coordinates.bottom = offsets.bottom;
    //         coordinates.left = offsets.left;
    //         coordinates.right = offsets.right;
    //     }
    //     ;
    //
    //     return coordinates;
    //
    // }
    //
    // const calculateCoordinate = (landmarks: Array<object>, finger: fingerEnum) => {
    //     let fingerCoordinate: fingerCoordinate;
    //     switch (finger) {
    //         case fingerEnum.PINKY_TIP:
    //             fingerCoordinate = landmarks[fingerEnum.PINKY_TIP] as fingerCoordinate;
    //             break;
    //         case fingerEnum.RING_FINGER_TIP:
    //             fingerCoordinate = landmarks[fingerEnum.RING_FINGER_TIP] as fingerCoordinate;
    //             break;
    //         case fingerEnum.MIDDLE_FINGER_TIP:
    //             fingerCoordinate = landmarks[fingerEnum.MIDDLE_FINGER_TIP] as fingerCoordinate;
    //             break;
    //         case fingerEnum.INDEX_FINGER_TIP:
    //             fingerCoordinate = landmarks[fingerEnum.INDEX_FINGER_TIP] as fingerCoordinate;
    //             break;
    //         case fingerEnum.THUMB_TIP:
    //             fingerCoordinate = landmarks[fingerEnum.THUMB_TIP] as fingerCoordinate;
    //             break;
    //     }
    //     return {
    //         // x: fingerCoordinate.x * window.innerWidth,
    //         // y: fingerCoordinate.y * window.innerHeight,
    //     };
    // }

    const addElementTouched = (elementId: detectedElement) => {
        let isTouched: boolean = touchedElements.some(touchedEl => {
            return touchedEl.elementId === elementId.elementId
        })

        if (isTouched) {
            // If the element has already been touched and is being hovered over
            elementId.timeElapsed = Date.now() - elementId.timestampTouched;
            setStoreTime(elementId.timeElapsed);

            // Check if 2000 milliseconds have passed. If so, click.
            if (elementId.elementId.substr(0, 4) === 'tile' && gameNotFinishedStore) {
                elementId.timeElapsed > 2000 && elementId.clicked === false && clickElement(elementId.elementId);
                elementId.elementId !== 'gamemodebutton1' &&
                elementId.elementId !== 'gamemodebutton2' &&
                elementId.timeElapsed > 2000 && elementId.clicked === false && clickElement('header-scoreboard');
                // elementId.timeElapsed > 2000 && elementId.clicked === false && clickElement('game-board-container');
                elementId.timeElapsed > 2000 && elementId.clicked === false && (elementId.clicked = true);
                // console.log(elementId.elementId, elementId.timeElapsed)
            } else if (elementId.elementId.substr(0, 4) !== 'tile') {
                elementId.timeElapsed > 2000 && elementId.clicked === false && clickElement(elementId.elementId);
                elementId.elementId !== 'gamemodebutton1' &&
                elementId.elementId !== 'gamemodebutton2' &&
                elementId.timeElapsed > 2000 && elementId.clicked === false && clickElement('header-scoreboard');
                // elementId.timeElapsed > 2000 && elementId.clicked === false && clickElement('game-board-container');
                elementId.timeElapsed > 2000 && elementId.clicked === false && (elementId.clicked = true);
                // console.log(elementId.elementId, elementId.timeElapsed)
            }

            // let replacementArray = touchedElements.slice(0, touchedElements.length);
            // let indexOfElement = replacementArray.findIndex(replacementEl => replacementEl.elementId === elementId.elementId);
            // console.log(elementId.elementId, indexOfElement, replacementArray[indexOfElement].elementId)


            // setTouchedElements(touchedElements => touchedElements.forEach(touchedEl => {
            //     if(touchedEl.elementId === elementId.elementId) {
            //         touchedEl.timeElapsed = Date.now() - elementId.timestampTouched;
            //     }
            // }));
        } else {
            // Hover started
            // console.log('hover start', touchedElements)
            elementId.timestampTouched = Date.now();
            elementId.timeElapsed = 0;
            setTouchedElements(touchedElements => touchedElements.concat([elementId]));
        }
    }
    const removeElementTouched = (elementId: detectedElement) => {
        setTouchedElements(
            touchedEl => touchedEl.filter(
                touchedElement => touchedElement.elementId !== elementId.elementId
            )
        );
    }

    const checkIfElementTouchedByIndex = (landmarks: Array<Array<object>>) => {
        /*

        */

        //Get coordinates of each index finger
        let amountOfHands: number = landmarks.length;
        let indexFingersCoordinates: Array<fingerCoordinate> = [];
        for (let index = 0; index < amountOfHands; index++) {
            indexFingersCoordinates = indexFingersCoordinates.concat(landmarks[index][fingerEnum.INDEX_FINGER_TIP] as fingerCoordinate);
        }

        setIndexCoordinates(indexFingersCoordinates[0]);

        // Register elements below each index finger
        let overlappingElements: Array<detectedElement> = [];
        let notOverlappingElements: Array<detectedElement> = [];
        for (let index = 0; index < indexFingersCoordinates.length; index++) {
            detectableElements.forEach(el => {
                let detected: boolean = between(indexFingersCoordinates[index].x * window.innerWidth, el.left, el.right)
                    &&
                    between(indexFingersCoordinates[index].y * window.innerHeight, el.top, el.bottom);
                detected ?
                    (overlappingElements = overlappingElements.concat([el]))
                    :
                    (notOverlappingElements = notOverlappingElements.concat([el]))
                ;
            })
        }

        detectableElements.forEach(detectableEl => {
            /*
              * For each finger:
              * Check if coordinate overlaps with an element
              * If yes && not in list             -> add to state of touched elements with timestamp
              * If yes && in list                 -> Run loading animation by simulating hover (mouseenter)
              * If yes && in list && timer up     -> Activate click
              * If no && in list                  -> Remove elements not overlapping from list
              *                                      & simulate mouse no longer hovering (mouseleave)
              * If no && not in list              -> Ignore
              *
              * */
            if (
                overlappingElements.some(overlappingEl => overlappingEl.elementId === detectableEl.elementId)
                && !touchedElements.some(touchedEl => touchedEl.elementId !== detectableEl.elementId)
            ) {
                // Touched for the first time
                // console.log('First time ', detectableEl.elementId);
                startHover(detectableEl.elementId);
                addElementTouched(detectableEl);
            } else if (
                overlappingElements.some(overlappingEl => overlappingEl.elementId === detectableEl.elementId)
                && touchedElements.some(touchedEl => touchedEl.elementId !== detectableEl.elementId)
            ) {
                // Continuing to hover
                // console.log('Hovering ', detectableEl.elementId);
                addElementTouched(detectableEl);

            } else if (
                !overlappingElements.some(overlappingEl => overlappingEl.elementId === detectableEl.elementId)
                && !touchedElements.some(touchedEl => touchedEl.elementId !== detectableEl.elementId)) {
                // Stopping to hover
                // console.log('Stopping to hover ', detectableEl.elementId);
                endHover(detectableEl.elementId)
                removeElementTouched(detectableEl);
            } else if (overlappingElements.length === 0) {
                setTouchedElements([]);
            }

        })

        // console.log(touchedElements);
        // For each overlapping element
        // overlappingElements.forEach(overlappingEl => {
        // let notInTouchedList: boolean = true;
        // touchedElements.forEach(touchedEl => {
        //     if (touchedEl.elementId === overlappingEl.elementId && overlappingEl.clicked === false) {
        //         notInTouchedList = false;
        //         console.log(overlappingEl.elementId)
        //         // Update timeElapsed
        //
        //         overlappingEl.timeElapsed = Date.now() - overlappingEl.timestampTouched;
        //         // console.log('Time elapsed ', overlappingEl.elementId, overlappingEl.timeElapsed, Date.now(), overlappingEl.timestampTouched)
        //         // Check if 2000 milliseconds have passed. If so, click.
        //         overlappingEl.timeElapsed > 2000 && overlappingEl.clicked === false && clickElement(overlappingEl.elementId);
        //         overlappingEl.timeElapsed > 2000 && overlappingEl.clicked === false && (overlappingEl.clicked = true);
        //         // overlappingEl.timeElapsed > 2000 && overlappingEl.clicked === false && console.log('click ', overlappingEl.elementId);
        //
        //         setTouchedElements(touchedElements => touchedElements.concat([overlappingEl]));
        //     }
        // })
        // if (notInTouchedList) {
        //     // Add to touchedElements[] & start hovering
        //     overlappingEl.timestampTouched = Date.now();
        //     overlappingEl.timeElapsed = 0;
        //     setTouchedElements(touchedElements => touchedElements.concat([overlappingEl]));
        //     startHover(overlappingEl.elementId);
        // }
        // })
        // notOverlappingElements.forEach(notOverlappingEl => {
        // console.log('not overlapping ', notOverlappingEl.elementId)
        // endHover(notOverlappingEl.elementId);
        // setTouchedElements(touchedElement =>
        //     touchedElement.filter(touchedElement => touchedElement !== notOverlappingEl)
        // );
        // })
        // Find which elements are no longer hovered over by an index finger
        // let noLongerTouched: Array<detectedElement> = [];
        // touchedElements.length > 0 && (noLongerTouched = touchedElements.filter(touchedEl => {
        //     // Some -> Does the array of overlapping elements contain the touched element
        //     // overlappingElements.some(el => el.elementId !== touchedEl.elementId)
        //     return overlappingElements.some((el) => {
        //         return el.elementId !== touchedEl.elementId;
        //     });
        // }))
        // if (overlappingElements.length === 0) {
        //     touchedElements.forEach(touchedEl => {
        //         endHover(touchedEl.elementId);
        //         setTouchedElements(touchedElement =>
        //             touchedElement.filter(touchedElement => touchedElement !== touchedEl)
        //         );
        //     })
        // } else {
        //     detectableElements.forEach(detectableEl => {
        //         let isElementDetectedoverlappingElements
        //     .
        //         some((overlappingEl) => {
        //             return overlappingEl.elementId !== = detectableEl.elementId;
        //         }) &&
        //
        //         if (removeElement) {
        //             endHover(touchedEl.elementId);
        //             setTouchedElements(touchedElement =>
        //                 touchedElement.filter(touchedElement => touchedElement !== touchedEl)
        //             );
        //         }
        //         ;
        //     })
        // }
        // if element in detected element is not in the list of overlapping elements
        // console.log('touchedElements ', touchedElements);
        // console.log('noLongerTouched ', noLongerTouched);
        // noLongerTouched.forEach(element => {
        //     console.log(element.elementId);
        //     endHover(element.elementId);
        //     setTouchedElements(touchedElement =>
        //         touchedElement.filter(touchedElement => touchedElement !== element)
        //     );
        // })
        // console.log('noLongerTouched ', noLongerTouched);
        // let touched = false;
        // For each hand
        // for (let index = 0; index < indexFingersCoordinates.length; index++) {
        //
        //     // console.log(touchedElements);
        //     if (element.current && touched) {
        //         // If element has activated
        //         if (touchedElements.includes(element.current.id)) {
        //         }
        //         // if element has not yet activated
        //         else {
        //             let elementToAdd: string = element.current.id;
        //             elementToAdd.length > 0 && setTouchedElements(touchedElement => touchedElement.concat([elementToAdd]));
        //             console.log('play note');
        //         }
        //     } else if (element.current && !touched) {
        //         // Element needs to be deactivated
        //         if (touchedElements.includes(element.current.id)) {
        //             let elementToRemove: string = element.current.id;
        //             elementToRemove.length > 0 && setTouchedElements(touchedElement =>
        //                 touchedElement.filter(touchedElement => touchedElement !== elementToRemove)
        //             );
        //
        //         }
        //         // if element does not need to be deactivated
        //         else {
        //
        //         }
        //     }
        // }
    }

    const setCountdownTimer = () => {
        let timePassed = false;
        (Date.now() - 100) > timeMillisecondsResetTimer && (timePassed = true);
        timePassed && (timeMillisecondsResetTimer = Date.now());
        timePassed && setCountdownWidth(countdownWidth => countdownWidth - 5);
    }

    const resetGame = () => {
        // // @ts-ignore
        // document.getElementById('app-container').setAttribute('data-finishedfinalcount', 'true');
        // // @ts-ignore
        // document.getElementById('app-container').setAttribute('data-finishedreset', 'true');
        // // @ts-ignore
        // document.getElementById('game-board-container').setAttribute('data-gamereset', 'true');
        // clickElement('game-board-container');
        // setTouchedElements([]);
        // setCountdownWidth(500);
        // setGameNotFinishedStore(true);
        // setDetectableElements([]);
        //
        // setTimeout(() => {
        //     findInteractiveElements();
        // }, 100);
        // @ts-ignore
        let dataStore = JSON.parse(localStorage.getItem('maisie_tictactoe_testdata'));
        // @ts-ignore
        dataStore !== null && (dataStore.at(-1).gameResetTime = new Date(Date.now()).toString());
        localStorage.setItem('maisie_tictactoe_testdata', JSON.stringify(
            dataStore
        ));
        window.location.reload()
    }

    useEffect(() => {
        // console.log(countdownWidth);
        // @ts-ignore
        let appContainer = document.getElementById('app-container');
        appContainer && appContainer.getAttribute('data-finishedfinalcount') === 'false' && countdownWidth < 1 && appContainer.setAttribute('data-finishedfinalcount', 'true');
    }, [countdownWidth])

    const onResults = (results: { multiHandLandmarks?: NormalizedLandmarkList[] | undefined; multiHandedness?: Handedness[] | undefined; }) => {
        // Check if Machine Learning model is loading
        modelStillLoading && setModelStillLoading(false);
        // Check if game is finished
        // @ts-ignore
        let gameFinishedState = document
            .getElementById('game-board-container')
            .getAttribute('data-gamefinished');
        gameFinishedState && gameFinishedState === 'true' && setGameNotFinishedStore(false);
        gameFinishedState && gameFinishedState === 'true' && setTilesToClicked();
        gameFinishedState && gameFinishedState === 'true' && findInteractiveElements();
        // @ts-ignore
        let finalCountDown = document
            .getElementById('app-container')
            .getAttribute('data-finishedfinalcount');
        // @ts-ignore
        let finishedReset = document
            .getElementById('app-container')
            .getAttribute('data-finishedreset');
        gameFinishedState && gameFinishedState === 'true' && finalCountDown === 'false' && finishedReset === 'false' && setCountdownTimer();

        // Check if reset of gamestate can happen
        finalCountDown === 'true' && console.log('RESET GAME');
        finalCountDown === 'true' && resetGame();

        canvasReference.current && (canvasCtx = canvasReference.current.getContext('2d'));
        if (canvasCtx) {
            webcamRef.current && webcamRef.current.video && (canvasCtx.width = webcamRef.current.video.videoWidth);
            webcamRef.current && webcamRef.current.video && (canvasCtx.height = webcamRef.current.video.videoHeight);
            canvasCtx.save();
            canvasReference.current && canvasCtx.clearRect(0, 0, canvasReference.current.width, canvasReference.current.height);


            // canvasCtx.fillStyle = "#ffffff";
            // canvasCtx.fillRect(0, 0, canvasCtx.width, canvasCtx.height);
            // let fingerCoordinatesList: Array<Array<object>> = [];

            if (results.multiHandLandmarks && results.multiHandedness) {
                setHandCoordinates(results);

                for (let index = 0; index < results.multiHandLandmarks.length; index++) {
                    const classification = results.multiHandedness[index];
                    const isRightHand = classification.label === 'Right';
                    const landmarks = results.multiHandLandmarks[index];

                    drawConnectors(
                        canvasCtx, landmarks, HAND_CONNECTIONS,
                        // {color: isRightHand ? '#00FF00' : '#FF0000'});
                        {color: isRightHand ? '#fff' : '#fff'});

                    // drawLandmarks(canvasCtx, landmarks, {
                    //     color: isRightHand ? '#00FF00' : '#FF0000',
                    //     fillColor: isRightHand ? '#FF0000' : '#00FF00',
                    //     radius: (x) => {
                    //         // @ts-ignore
                    //         return lerp(x.from?.z, -0.15, .1, 1, 1);
                    //     }
                    // });

                }
            }
            canvasCtx.restore();
        }
    }

    useEffect(() => {
        window.addEventListener("resize", handleResize, false);
        hands = new Hands({
            locateFile: (file: string) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.3.1620248595/${file}`;
            },
        });
        hands.setOptions({
            selfieMode: handsMirrored,
            maxNumHands: 1,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6,
        });
        hands.onResults(onResults);

        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null
        ) {
            // @ts-ignore
            camera = new Camera(webcamRef.current.video, {
                onFrame: async () => {
                    let timePassed = false;
                    (Date.now() - 100) > timeMilliseconds && (timePassed = true);
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
        <div
            className="App"
            id={'app-container'}
            data-finishedfinalcount={'false'}
            data-finishedreset={'false'}
            onClick={(e) => {
                findInteractiveElements()
            }}>
            {modelStillLoading && <div style={{zIndex: 15, position: 'absolute', left: '0', right: '0', top: '200px'}}>
                <h3 style={{fontSize: '200%', textAlign: 'center'}}>Loading the hand detection model...</h3>
                <LoadingSpinner/>
            </div>}
            {gameNotFinishedStore === false && <div style={{
                position: 'relative',
                margin: '60px auto',
                width: '500px',
                height: '40px',
                padding: '8px',
                backgroundColor: 'rgba(209, 216, 224, 0.6)',
                borderRadius: '32px',
                display: 'flex',
                justifyContent: 'center',
                zIndex: 15,
            }}>
                <p className={'closing'}>Terug naar het startscherm</p>
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        width: countdownWidth + 'px',
                        height: '40px',
                        padding: '8px',
                        backgroundColor: '#d1d8e0',
                        borderRadius: '32px',
                        zIndex: 4,
                        transition: 'width 0.2s ease-in-out',
                    }}/>
            </div>}
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
                    zIndex: 9,
                    width: window.innerWidth,
                    height: window.innerHeight,
                }}
            />
            {showHovering && <Feedback
                x={indexCoordinates.x * window.innerWidth}
                y={indexCoordinates.y * window.innerHeight}
                percent={storeTime}/>}
        </div>
    );
}

export default HandDetection;
