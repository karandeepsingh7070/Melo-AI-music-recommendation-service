'use client'
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import rekognition from "../lib/aws-config.js";

export default function MoodUploader() {
    const [image, setImage] = useState<any>(null);
    const [preview, setPreview] = useState<string>('');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file: any = (e.target as HTMLInputElement).files;
        if (file?.length && file[0] instanceof Blob) {
            setImage(file[0]);
            setPreview(URL.createObjectURL(file[0]));
        } else {
            console.error("Invalid file upload");
        }
    };

    const detectMood = async () => {
        if (!image) return;

        const reader = new FileReader();
        reader.readAsArrayBuffer(image);

        reader.onloadend = async () => {
            if (reader.result instanceof ArrayBuffer) {
                const imageBytes = new Uint8Array(reader.result);

                const params = {
                    Image: { Bytes: imageBytes },
                    Attributes: ["ALL"],
                };

                try {
                    const response = await rekognition.detectFaces(params).promise();
                    const emotions = response?.FaceDetails?.[0]?.Emotions || [];
                    const topEmotion = emotions.sort((a, b) => (b.Confidence ?? 0 )- (a.Confidence ?? 0))[0];

                    console.log("Detected Emotion:", topEmotion?.Type);
                } catch (error) {
                    console.error("Error detecting mood:", error);
                }
            };
        }
    };

    useEffect(() => {
        detectMood()
    }, [image])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-300 to-blue-300 p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-6 rounded-2xl shadow-xl text-center w-80"
            >
                <h2 className="text-xl font-semibold mb-4">Upload a Selfie</h2>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mb-4 file:hidden text-sm"
                />
                {preview && (
                    <motion.img
                        src={preview}
                        alt="Uploaded preview"
                        className="w-40 h-40 object-cover rounded-full mx-auto mb-4 border-4 border-blue-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    />
                )}
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition disabled:opacity-50"
                    disabled={!image}
                >
                    Detect Mood
                </button>
            </motion.div>
        </div>
    );
}
