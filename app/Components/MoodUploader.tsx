'use client'
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import rekognition from "../lib/aws-config.js";
import getAccessToken from "../lib/spotify";
import { moodPlaylists } from "../utils/playlist"
import { Emotion } from "aws-sdk/clients/rekognition.js";

export default function MoodUploader() {
    const [image, setImage] = useState<any>(null);
    const [preview, setPreview] = useState<string>('');
    const [mood, setMood] = useState<any>(null);
    const [playlist, setPlaylist] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file: any = (e.target as HTMLInputElement).files;
        if (file?.length && file[0] instanceof Blob) {
            setImage(file[0]);
            setPreview(URL.createObjectURL(file[0]));
        } else {
            console.error("Invalid file upload");
        }
    };

    const fetchSpotifyPlaylist = async (mood: any) => {
        const accessToken = await getAccessToken();

        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${mood}&type=playlist&limit=5`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const data = await response.json();
        console.log(data)
        let filteredData = data?.playlists?.items?.filter((playlist) => playlist != null)
        return filteredData?.map((playlist) => ({
            name: playlist?.name,
            url: playlist?.external_urls.spotify,
            image: playlist?.images?.[0]?.url,
            preview: playlist.tracks?.items?.[0]?.preview_url || null
        }));
    };

    const detectMood = async () => {
        if (!image) return;
        setLoading(true);
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
                    const topEmotion: Emotion = emotions.sort((a, b) => (b.Confidence ?? 0) - (a.Confidence ?? 0))[0];

                    if (topEmotion) {
                        setMood(topEmotion?.Type);
                        let playlistData = await fetchSpotifyPlaylist(topEmotion?.Type)
                        setPlaylist(playlistData);
                        setLoading(false);
                    } else {
                        setMood("Unknown 😕");
                    }
                } catch (error) {
                    console.error("Error detecting mood:", error);
                    setMood("Error detecting mood: 😕");
                    setPlaylist(["No songs available"]);
                    setLoading(false);
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
                {mood && (
                    <motion.p
                        className="mt-4 text-md font-semibold text-blue-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        Mood Detected: {mood}
                    </motion.p>
                )}
                {loading ? (
                    <motion.div
                        className="mt-4 animate-spin w-8 h-8 border-4 mx-auto border-blue-400 border-t-transparent rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />
                ) : <>{playlist.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {playlist.map((item, index) => (
                        <motion.a
                            href={item.url}
                          key={index}
                          className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center transition transform hover:scale-105"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md mb-2 shadow-md" />
                          <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                          {item.preview && (
                            <audio controls className="mt-2 w-full">
                              <source src={item.preview} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          )}
                        </motion.a>
                      ))}
                    </div>
                  )}</>}

            </motion.div>
        </div>
    );
}
