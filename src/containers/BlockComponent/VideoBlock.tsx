import React, { useCallback, useEffect, useRef, useState } from "react";
import { TextAlign, VideoBlockProps, VideoProps } from "types";
import Droppable from "@containers/Droppable";
import { convertStringtoStyle } from "@utils/index";
import { useTheme } from "styled-components";
import LoadingSpinner from "@components/lib/LoadingContainer";
import { defaultPlaceholderImage } from "@utils/constant";

interface CustomVideoProps {
  videoUrl?: string;
  youtubeVideoUrl?: string;
  thumbnailUrl?: string;
  altText?: string;
  alignment: string;
  width?: number;
  height?: number;
  borderRadius?: number;
}

export const extractYouTubeId = (url: string): string | null => {
  try {
    const u = new URL(url);

    // Accept youtube.com, music.youtube.com, m.youtube.com, etc.
    if (u.hostname === "youtu.be" || u.hostname.endsWith("youtube.com")) {
      // Case: normal watch links (including music.youtube.com/watch?v=xxx)
      const v = u.searchParams.get("v");
      if (v && v.length === 11) return v;

      // Case: short links like https://youtu.be/xxxxxxx
      if (u.hostname === "youtu.be") {
        const id = u.pathname.replace("/", "");
        if (id && id.length === 11) return id;
      }
    }
  } catch (err) {
    // Invalid URL
    return null;
  }
  return null;
};

export const extractVimeoId = (url: string): string | null => {
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
  const match = url.match(vimeoRegex);
  return match ? match[1] : null;
};

const CustomVideo: React.FC<CustomVideoProps> = React.memo(
  ({
    videoUrl,
    youtubeVideoUrl,
    thumbnailUrl,
    altText,
    alignment,
    width,
    borderRadius,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [resolvedThumbnail, setResolvedThumbnail] = useState<string | null>(
      defaultPlaceholderImage
    );
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    const videoLink = youtubeVideoUrl || videoUrl || "#";

    // Resolve thumbnail
    useEffect(() => {
      const resolveThumbnail = async () => {
        if (youtubeVideoUrl) {
          const youtubeId = extractYouTubeId(youtubeVideoUrl);
          const vimeoId = extractVimeoId(youtubeVideoUrl);

          if (youtubeId) {
            setResolvedThumbnail(
              `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
            );
          } else if (vimeoId) {
            try {
              const res = await fetch(
                `https://vimeo.com/api/v2/video/${vimeoId}.json`
              );
              const data = await res.json();
              setResolvedThumbnail(data[0]?.thumbnail_large || null);
            } catch {
              setResolvedThumbnail(null);
            }
          } else {
            setResolvedThumbnail(null);
          }
        } else if (videoUrl) {
          setResolvedThumbnail(thumbnailUrl || null);
        } else {
          setResolvedThumbnail(null);
        }
        setIsLoading(false);
      };

      resolveThumbnail();
    }, [youtubeVideoUrl, videoUrl, thumbnailUrl]);

    // Measure thumbnail natural size
    useEffect(() => {
      if (!resolvedThumbnail) return;
      const img = new Image();
      img.src = resolvedThumbnail;
      img.onload = () => {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      };
    }, [resolvedThumbnail]);

    // Watch container size
    useEffect(() => {
      if (!containerRef.current) return;

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width) {
            setContainerWidth(entry.contentRect.width);
          }
        }
      });

      observer.observe(containerRef.current);

      return () => observer.disconnect();
    }, []);

    // Calculate actual width
    const calculatedWidth =
      width && naturalSize.width
        ? (naturalSize.width * width) / 100
        : naturalSize.width;

    const finalWidth = Math.min(
      calculatedWidth,
      naturalSize.width,
      containerWidth || naturalSize.width
    );

    const wrapperStyle: React.CSSProperties = {
      display: "flex",
      justifyContent:
        alignment === "center"
          ? "center"
          : alignment === "right"
          ? "flex-end"
          : "flex-start",
      width: "100%",

      overflow: borderRadius ? "hidden" : undefined,
    };

    const containerStyle: React.CSSProperties = {
      width: finalWidth,
      height: "auto",
      position: "relative",
      cursor: "pointer",
    };

    const imgStyle: React.CSSProperties = {
      display: "block",
      width: "100%",
      height: "auto",
      objectFit: "contain",
    };

    const playButtonStyle: React.CSSProperties = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 64,
      height: 64,
      background: "rgba(0,0,0,0.6)",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };

    const triangleStyle: React.CSSProperties = {
      width: 0,
      height: 0,
      borderLeft: "16px solid #fff",
      borderTop: "10px solid transparent",
      borderBottom: "10px solid transparent",
      marginLeft: 4,
    };

    if (isLoading) {
      return <LoadingSpinner size={50} color="#007bff" />;
    }
    console.log("Rendering video with thumbnail:", resolvedThumbnail);
    return (
      <div ref={containerRef} style={wrapperStyle}>
        <a
          href={videoLink}
          target="_blank"
          rel="noopener noreferrer"
          style={containerStyle}
        >
          <img
            src={
              resolvedThumbnail ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQNJgVPk88H7N4njkQXBGIBomyJly6uSngxQ&s"
            }
            alt={altText || "Video Thumbnail"}
            style={imgStyle}
          />
          <div style={playButtonStyle}>
            <div style={triangleStyle}></div>
          </div>
        </a>
      </div>
    );
  }
);

export const VideoBlock: React.FC<VideoBlockProps> = ({
  block,
  handleBlockClick,
  handleDropper,
  isSelected,
}) => {
  const {
    videoUrl,
    thumbnailUrl,
    width,
    height,
    alignment,
    backgroundColor,
    padding,
    customCss,
    borderColor,
    borderRadius,
    borderStyle,
    borderWidth,
    youtubeVideoUrl,
    ...rest
  } = block as VideoProps;

  const theme = useTheme();

  const handleDrop = useCallback(
    (item: { type: string; name: string; id: number }) => {
      handleDropper(item, block.id);
    },
    [handleDropper, block.id]
  );

  const convertedStyle = convertStringtoStyle(customCss);

  return (
    <Droppable
      id={`block-${block.id}`}
      accept="BLOCK"
      onDrop={handleDrop}
      style={{
        display: "flex",
        justifyContent:
          (alignment as TextAlign) === "center"
            ? "center"
            : (alignment as TextAlign) === "right"
            ? "flex-end"
            : "flex-start",
        width: "100%",
        height: "auto",
        paddingTop: padding.top,
        paddingRight: padding.right,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left,
        backgroundColor,
        lineHeight: 0,
        outline:
          isSelected && block.parentId
            ? `1px dashed ${theme.colors.primary}`
            : "none",
        zIndex: isSelected ? 10 : "auto",
        borderRadius: borderRadius ? `${borderRadius}px` : undefined,
        border: borderWidth
          ? `${borderWidth}px ${borderStyle || "solid"} ${
              borderColor || "#000"
            }`
          : undefined,
        ...convertedStyle,
        ...rest,
        position: "relative", // Ensure relative positioning for play button
      }}
      onClick={handleBlockClick}
    >
      <CustomVideo
        videoUrl={videoUrl}
        thumbnailUrl={thumbnailUrl}
        alignment={alignment}
        width={width}
        height={undefined}
        borderRadius={borderRadius}
        youtubeVideoUrl={youtubeVideoUrl}
      />
    </Droppable>
  );
};

export default VideoBlock;
