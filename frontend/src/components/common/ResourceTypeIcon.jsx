import AttachFileRounded from "@mui/icons-material/AttachFileRounded";
import PictureAsPdfRounded from "@mui/icons-material/PictureAsPdfRounded";
import ImageRounded from "@mui/icons-material/ImageRounded";
import VideocamRounded from "@mui/icons-material/VideocamRounded";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import SlideshowRounded from "@mui/icons-material/SlideshowRounded";
import TableChartRounded from "@mui/icons-material/TableChartRounded";
import FolderZipRounded from "@mui/icons-material/FolderZipRounded";
import InsertDriveFileRounded from "@mui/icons-material/InsertDriveFileRounded";

const RESOURCE_ICONS = {
  PDF: PictureAsPdfRounded,
  IMAGE: ImageRounded,
  VIDEO: VideocamRounded,
  DOCUMENT: DescriptionRounded,
  PRESENTATION: SlideshowRounded,
  SPREADSHEET: TableChartRounded,
  ARCHIVE: FolderZipRounded,
};

/** Renders the MUI icon for a learning-resource type (stable component, safe in render). */
export default function ResourceTypeIcon({
  type,
  className,
  sx,
  fontSize = "inherit",
}) {
  const IconComponent =
    RESOURCE_ICONS[type] || InsertDriveFileRounded || AttachFileRounded;

  return (
    <IconComponent className={className} sx={sx} fontSize={fontSize} />
  );
}
