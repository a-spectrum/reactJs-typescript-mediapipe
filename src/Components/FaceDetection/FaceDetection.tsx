import React, { useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera, CameraOptions } from '@mediapipe/camera_utils'
import {
  FaceMesh,
  FACEMESH_TESSELATION,
  FACEMESH_RIGHT_EYE,
  FACEMESH_LEFT_EYE,
  FACEMESH_RIGHT_EYEBROW,
  FACEMESH_LEFT_EYEBROW,
  FACEMESH_FACE_OVAL,
  FACEMESH_LIPS
} from '@mediapipe/face_mesh'
import { drawConnectors } from '@mediapipe/drawing_utils'

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user"
};

function FaceDetection() {
  const webcamRef: any = React.useRef(null);
  const canvasReference: any = React.useRef();
  const [cameraReady, setCameraReady] = useState(false);
  let canvasCtx: any;
  let camera: any;

  function onResults(results: any){
      canvasCtx = canvasReference.current.getContext('2d');
      canvasCtx.width = webcamRef.current.video.videoWidth;
      canvasCtx.height = webcamRef.current.video.videoHeight;
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasReference.current.width, canvasReference.current.height);
      // canvasCtx.drawImage(results.image, 0, 0, canvasReference.current.width, canvasReference.current.height);
      if (results.multiFaceLandmarks) {
          for (const landmarks of results.multiFaceLandmarks) {
              drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
              drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, { color: '#FF3030' });
              drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#FF3030' });
              drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, { color: '#30FF30' });
              drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, { color: '#30FF30' });
              drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, { color: '#E0E0E0' });
              drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: '#E0E0E0' });
          }
      }
      canvasCtx.restore();
  }

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);

    if (
        typeof webcamRef.current !== "undefined" &&
        webcamRef.current !== null
    ) {
      // @ts-ignore
        camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          // @ts-ignore
            await faceMesh.send({ image: webcamRef.current.video });
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    }
  }, []);


  // const faceMesh = new FaceMesh({
  //   locateFile: (file) => {
  //     return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  //   }
  // });
  // faceMesh.setOptions({
  //   selfieMode: true,
  //   maxNumFaces: 1,
  //   minDetectionConfidence: 0.5,
  //   minTrackingConfidence: 0.5
  // });
  // faceMesh.onResults(onResults);


  return (
      <div className="App">
        <Webcam
            audio={false}
            height={720}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={1280}
            videoConstraints={videoConstraints}
            onUserMedia={() => {
              console.log('webcamRef.current', webcamRef.current);
              // navigator.mediaDevices
              //   .getUserMedia({ video: true })
              //   .then(stream => webcamRef.current.srcObject = stream)
              //   .catch(console.log);

              setCameraReady(true)
            }}
        />
        <canvas
            ref={canvasReference}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zIndex: 9,
              width: 1280,
              height: 720,
            }}
        />

      </div >
  );
}

export default FaceDetection;
