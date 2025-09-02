import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setResult(null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const captureFromWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        setImage(file);
        setPreview(imageSrc);
        setResult(null);
        setShowWebcam(false);
      });
  };

  const handleSubmit = async () => {
    if (!image) return toast.error("Upload or capture an image first!");

    const formData = new FormData();
    formData.append('file', image);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        toast.success("Prediction successful!");
      } else {
        toast.error(data.error || "Prediction failed!");
      }
    } catch (err) {
      toast.error("Server error: " + err.message);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setShowWebcam(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gradient-to-r from-blue-100 via-white to-blue-100 rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">🚦 Traffic Sign Detector</h1>

      <div className="flex flex-col gap-4">
        {!result && (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 p-2 rounded-md"
            />
            <button
              onClick={() => setShowWebcam(!showWebcam)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg"
            >
              {showWebcam ? "Close Camera" : "📷 Use Camera"}
            </button>
          </>
        )}

        {showWebcam && (
          <div className="relative mx-auto">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded border-2 border-blue-400"
            />
            <button
              onClick={captureFromWebcam}
              className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
            >
              📸 Capture Photo
            </button>
          </div>
        )}

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mx-auto h-48 object-contain border-2 border-blue-400 rounded-lg shadow hover:scale-105 transition-transform"
          />
        )}

        {!result && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition disabled:bg-blue-300"
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="w-5 h-5 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                Detecting...
              </div>
            ) : (
              "Detect Traffic Sign"
            )}
          </button>
        )}

        {result && (
          <div className="mt-4 p-4 bg-white border rounded-lg text-center shadow-md">
            <p className="text-xl font-semibold text-blue-800">
              ✅ Class: <span className="text-black">{result.class}</span>
            </p>

            <p className="text-md mt-2 text-gray-700 mb-1">Confidence:</p>
            <div className="w-full bg-gray-300 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${(result.confidence * 100).toFixed(2)}%` }}
              ></div>
            </div>
            <p className="text-sm mt-1">
              {(result.confidence * 100).toFixed(2)}%{" "}
              {result.confidence > 0.9 ? "🔥" : result.confidence > 0.7 ? "👍" : "🤔"}
            </p>

            <button
              onClick={handleReset}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg"
            >
              🔁 Detect Another
            </button>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;
