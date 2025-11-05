"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
	onFileSelect?: (file: File) => void;
	onError?: (error: string) => void;
	className?: string;
	maxSizeMB?: number;
};

const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
];

function isValidImageFile(file: File): boolean {
	return ACCEPTED_IMAGE_TYPES.includes(file.type);
}

export function ImageUpload({
	onFileSelect,
	onError,
	className,
	maxSizeMB = 10,
}: ImageUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [preview, setPreview] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFile = (file: File) => {
		if (!isValidImageFile(file)) {
			onError?.("Please select a valid image file (JPEG, PNG, GIF, WebP, or SVG)");
			return;
		}

		const fileSizeMB = file.size / (1024 * 1024);
		if (fileSizeMB > maxSizeMB) {
			onError?.(`File size must be less than ${maxSizeMB}MB`);
			return;
		}

		setSelectedFile(file);
		onFileSelect?.(file);

		// Create preview
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			handleFile(files[0]);
		}
	};

	const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			handleFile(files[0]);
		}
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		setPreview(null);
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className={cn("w-full", className)}>
			<div
				onDragEnter={handleDragEnter}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={handleClick}
				className={cn(
					"relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors bg-[#212121]",
					isDragging
						? "border-[#FFD700] bg-[#2a2a2a]"
						: "border-[#424242] hover:border-[#616161]",
					preview && "border-solid"
				)}
			>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileInputChange}
					className="hidden"
					aria-label="Upload image file"
				/>

				{preview ? (
					<div className="relative">
						<img
							src={preview}
							alt="Preview"
							className="max-h-64 mx-auto rounded-lg"
						/>
						<button
							type="button"
							onClick={handleClear}
							className="absolute top-2 right-2 p-1 bg-[#F44336] text-white rounded-full hover:bg-[#E53935] transition-colors"
							aria-label="Remove image"
						>
							<X className="w-4 h-4" />
						</button>
						{selectedFile && (
							<p className="mt-2 text-sm text-[#B0B0B0]">
								{selectedFile.name}
							</p>
						)}
					</div>
				) : (
					<div className="flex flex-col items-center gap-4">
						<Upload className="w-12 h-12 text-[#B0B0B0]" />
						<div>
							<p className="text-sm font-medium text-[#E0E0E0]">
								Drag and drop an image here, or click to select
							</p>
							<p className="text-xs text-[#B0B0B0] mt-1">
								Supported: JPEG, PNG, GIF, WebP, SVG (max {maxSizeMB}MB)
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

