"use client";

import { logout } from "@/redux/features/authSlice";
import Header from "@/utils/header";
import Sidebar from "@/utils/sideBar";
import {
  Card,
  CardContent,
  Divider,
  Typography,
  Modal,
  Box,
  TextField,
  Button,
  Checkbox,
  Tooltip,
  Autocomplete,
  Pagination,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBookingByUserId, getBookingSlotByDate } from "@/services/booking";
import { getPitchById } from "@/services/pitch";
import {
  getReviewByPitch,
  createReview,
  updateReview,
  deleteReview,
  reviewRequestDTO,
} from "@/services/review";
import { FaStar } from "react-icons/fa";
import { CiStar } from "react-icons/ci";
import f from "../../../../public/images/field3.jpg";
import dayjs from "dayjs";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { toast } from "react-toastify";

interface PitchResponseDTO {
  pitchId: string;
  providerAddressId: string;
  name: string;
  type: "FIVE_A_SIDE" | "SEVEN_A_SIDE" | "ELEVEN_A_SIDE";
  price: number;
  description?: string;
}

interface reviewResponseDTO {
  reviewId: string;
  pitchId: string;
  userId: string;
  rating: number;
  comment: string;
  createat: string;
}

const buttonBase =
  "w-8 h-8 flex items-center justify-center rounded-md transition-all";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const ITEMS_PER_PAGE = 8;

const reviewHistory: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [pitches, setPitches] = useState<PitchResponseDTO[]>([]);
  const [reviews, setReviews] = useState<reviewResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [newReview, setNewReview] = useState<{
    pitchId: string;
    rating: number;
    comment: string;
  }>({
    pitchId: "",
    rating: 5,
    comment: "",
  });
  const [editReview, setEditReview] = useState<{
    rating: number;
    comment: string;
  }>({
    rating: 5,
    comment: "",
  });
  const [pitchPage, setPitchPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);

  const user = useSelector((state: any) => state.auth.user);
  const baseTabs = [
    { label: "Thông tin cá nhân", value: 0 },
    { label: "Thông báo", value: 2 },
  ];

  const providerTabs = [
    { label: "Thông tin cá nhân", value: 0 },
    { label: "Thông tin sân", value: 1 },
    { label: "Thông tin đặt sân", value: 2 },
  ];

  const tabs = user?.role === "PROVIDER" ? providerTabs : baseTabs;

  const [initTab, setInitTab] = useState(tabs[0].value);
  const [show, setShow] = useState(false);

  const handleShow = (event: React.MouseEvent<HTMLElement>) => {
    setShow(!show);
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setInitTab(newValue);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-green-600 text-[0.7rem]" />
        ) : (
          <CiStar key={i} className="text-[0.8rem] text-green-600" />
        )
      );
    }
    return stars;
  };

  const truncateName = (name: string, maxLength: number = 15) => {
    if (name.length > maxLength) {
      return name.substring(0, 12) + "...";
    }
    return name;
  };

  const fetchData = async () => {
    if (!user || !user.userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const bookRes = await getBookingByUserId(user.userId);
      const uniquePitches = new Map<string, PitchResponseDTO>();
      const userReviews: reviewResponseDTO[] = [];

      await Promise.all(
        (bookRes || []).map(async (booking) => {
          const date = dayjs(booking.bookingDate).format("YYYY-MM-DD");
          const slotData = await getBookingSlotByDate(date);
          const slotInfo = slotData.find(
            (slot: { pitchId: string; bookedSlots: number[] }) =>
              slot.bookedSlots.includes(booking.bookingDetails[0]?.slot)
          );
          if (slotInfo?.pitchId && !uniquePitches.has(slotInfo.pitchId)) {
            const pitch = await getPitchById(slotInfo.pitchId);
            if (pitch) {
              uniquePitches.set(pitch.pitchId, pitch);
              const pitchReviews = await getReviewByPitch(slotInfo.pitchId);
              const userReview = pitchReviews.find(
                (review) => review.userId === user.userId
              );
              if (userReview) {
                userReviews.push(userReview);
              }
            }
          }
        })
      );

      setPitches(Array.from(uniquePitches.values()));
      setReviews(userReviews);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handlePitchClick = async (pitch: PitchResponseDTO) => {
    const pitchReviews = await getReviewByPitch(pitch.pitchId);
    const userReview = pitchReviews.find(
      (review) => review.userId === user.userId
    );
    if (userReview) {
      setEditReview({ rating: userReview.rating, comment: userReview.comment });
      setNewReview({ ...newReview, pitchId: pitch.pitchId });
      setSelectedId(userReview.reviewId);
      setOpenEditModal(true);
    } else {
      setNewReview({ pitchId: pitch.pitchId, rating: 5, comment: "" });
      setOpenAddModal(true);
    }
  };

  const handleAddClick = () => {
    setNewReview({
      pitchId: "",
      rating: 5,
      comment: "",
    });
    setOpenAddModal(true);
  };

  const handleEditClick = () => {
    if (selectedId) {
      const review = reviews.find((r) => r.reviewId === selectedId);
      if (review) {
        setEditReview({ rating: review.rating, comment: review.comment });
        setNewReview({ ...newReview, pitchId: review.pitchId });
        setOpenEditModal(true);
      }
    }
  };

  const handleDeleteClick = () => {
    if (selectedId) {
      setOpenDeleteModal(true);
    }
  };

  const handleAddSubmit = async () => {
    if (!user?.userId || !newReview.pitchId) return;
    try {
      const payload: reviewRequestDTO = {
        pitchId: newReview.pitchId,
        userId: user.userId,
        rating: newReview.rating,
        comment: newReview.comment,
      };
      await createReview(payload);
      toast.success("Thêm đánh giá thành công");
      setOpenAddModal(false);
      await fetchData();
    } catch (error) {
      console.error("Lỗi khi tạo đánh giá:", error);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedId || !user?.userId || !newReview.pitchId) return;
    try {
      const payload: reviewRequestDTO = {
        pitchId: newReview.pitchId,
        userId: user.userId,
        rating: editReview.rating,
        comment: editReview.comment,
      };
      await updateReview(selectedId, payload);
      toast.success("Cập nhật đánh giá thành công");
      setOpenEditModal(false);
      setSelectedId(null);
      await fetchData();
    } catch (error) {
      console.error("Lỗi khi cập nhật đánh giá:", error);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedId) return;
    try {
      await deleteReview(selectedId);
      toast.success("Xóa đánh giá thành công");
      setOpenDeleteModal(false);
      setSelectedId(null);
      await fetchData();
    } catch (error) {
      console.error("Lỗi khi xóa đánh giá:", error);
    }
  };

  const handlePitchPageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPitchPage(value);
  };

  const handleReviewPageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setReviewPage(value);
  };

  const paginatedPitches = pitches.slice(
    (pitchPage - 1) * ITEMS_PER_PAGE,
    pitchPage * ITEMS_PER_PAGE
  );

  const paginatedReviews = reviews.slice(
    (reviewPage - 1) * ITEMS_PER_PAGE,
    reviewPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 mx-auto flex flex-col space-y-[1rem] sm:space-y-[2rem] pt-[80px] pb-[100px]">
      <Header />
      <div className="main flex items-start justify-center gap-x-[2rem]">
        <Sidebar
          tabs={tabs}
          show={show}
          handleShow={handleShow}
          initTab={initTab}
          handleChangeTab={handleChangeTab}
          handleLogout={handleLogout}
        />
        <div className="w-[75%] mt-[1.5rem] space-y-[2rem]">
          <div className="flex flex-col items-start justify-start gap-y-[1rem]">
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Lịch sử đánh giá
            </Typography>
            <div className="bg-white w-full flex flex-col justify-start rounded-lg shadow-md py-6 px-10 right-sidebar gap-y-[1.5rem]">
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Các sân đã đặt
              </Typography>
              <div className="pitches grid grid-cols-4 gap-x-[1rem]">
                {paginatedPitches.length > 0 ? (
                  paginatedPitches.map((pitch) => (
                    <Card
                      key={pitch.pitchId}
                      className="w-[250px] h-[220px] bg-white rounded-[10px] shadow-md flex flex-col items-start gap-y-[0.8rem] cursor-pointer"
                      onClick={() => handlePitchClick(pitch)}
                    >
                      <img
                        src={f.src}
                        alt="Field"
                        className="w-full h-[95px] rounded-t-[10px] object-cover"
                      />
                      <div className="content flex flex-col gap-y-[0.2rem] ml-[1rem]">
                        <div className="ratings flex items-center gap-x-[0.5rem]">
                          <FaStar className="text-green-600 text-[0.7rem]" />
                          <FaStar className="text-green-600 text-[0.7rem]" />
                          <FaStar className="text-green-600 text-[0.7rem]" />
                          <FaStar className="text-green-600 text-[0.7rem]" />
                          <CiStar className="text-[0.8rem] text-green-600" />
                        </div>
                        <Typography fontWeight={700}>
                          Sân {pitch.name} (sân{" "}
                          {pitch.type === "FIVE_A_SIDE"
                            ? 5
                            : pitch.type === "SEVEN_A_SIDE"
                              ? 7
                              : 11}
                          )
                        </Typography>
                        <Typography>{pitch.price} VNĐ</Typography>
                        <div className="flex items-center gap-x-[0.5rem]">
                          <div className="bg-blue-600 text-white font-bold rounded-md py-[0.3rem] px-[0.3rem] text-[0.8rem] w-[50px] flex-shrink-0 text-center">
                            8/10
                          </div>
                          <div className="field-info text-[1rem] flex-1">
                            {pitch.description || "Không có thông tin"}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Typography
                    variant="body1"
                    sx={{ gridColumn: "span 4", textAlign: "center" }}
                  >
                    Bạn chưa đặt sân nào
                  </Typography>
                )}
              </div>
              {pitches.length > ITEMS_PER_PAGE && (
                <Pagination
                  count={Math.ceil(pitches.length / ITEMS_PER_PAGE)}
                  page={pitchPage}
                  onChange={handlePitchPageChange}
                  sx={{ mt: 2, alignSelf: "center" }}
                />
              )}

              <Divider
                sx={{
                  borderBottomWidth: "1px",
                  borderColor: "black",
                  width: "100%",
                }}
              />
              <div className="flex items-center gap-x-[2rem] mb-4">
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Các đánh giá đã thực hiện
                </Typography>
                <div className="flex space-x-4">
                  <Tooltip title="Thêm đánh giá" arrow>
                    <div
                      className={`${buttonBase} bg-[#e25b43] text-white cursor-pointer`}
                      onClick={handleAddClick}
                    >
                      <AddOutlinedIcon fontSize="medium" />
                    </div>
                  </Tooltip>
                  <Tooltip title="Sửa đánh giá" arrow>
                    <div
                      className={`${buttonBase} ${
                        selectedId
                          ? "bg-[#e25b43] text-white cursor-pointer"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      onClick={handleEditClick}
                    >
                      <EditOutlinedIcon fontSize="medium" />
                    </div>
                  </Tooltip>
                  <Tooltip title="Xóa đánh giá" arrow>
                    <div
                      className={`${buttonBase} ${
                        selectedId
                          ? "bg-[#e25b43] text-white cursor-pointer"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      onClick={handleDeleteClick}
                    >
                      <DeleteOutlineOutlinedIcon fontSize="medium" />
                    </div>
                  </Tooltip>
                </div>
              </div>
              <div className="reviews grid grid-cols-4 gap-x-[1rem]">
                {paginatedReviews.length > 0 ? (
                  paginatedReviews.map((review, index) => (
                    <Card
                      key={review.reviewId}
                      sx={{
                        maxWidth: "250px",
                        height: "250px",
                        position: "relative",
                        paddingBottom: "50px",
                      }}
                    >
                      <CardContent
                        sx={{
                          padding: "1rem",
                          height: "100%",
                          display: "flex",
                          gap: "1rem",
                          flexDirection: "column",
                        }}
                      >
                        <div className="header flex items-center gap-[1rem]">
                          <img
                            src={f.src}
                            className="rounded-full h-12 w-12 object-cover"
                            alt="Avatar"
                          />
                          <div className="flex flex-col gap-y-[0.4rem] pb-[0.2rem]">
                            <p className="font-bold text-[1.2rem]">
                              {truncateName(user.name || "Người dùng")}
                            </p>
                            <div className="stars flex items-start gap-x-[0.5rem]">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <Checkbox
                            checked={selectedId === review.reviewId}
                            onChange={() =>
                              setSelectedId(
                                selectedId === review.reviewId
                                  ? null
                                  : review.reviewId
                              )
                            }
                            sx={{ position: "absolute", top: 0, right: 0 }}
                          />
                        </div>
                        <p
                          className="font-medium text-[0.9rem] text-justify"
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            marginTop: "0.5rem",
                          }}
                        >
                          {review.comment}
                        </p>
                      </CardContent>
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "0 1rem 1rem 1rem",
                        }}
                      >
                        <Divider
                          sx={{
                            borderColor: "#ccc",
                            borderWidth: "1px",
                            marginBottom: "0.5rem",
                          }}
                        />
                        <p className="text-[1rem] text-justify">
                          Đã đánh giá vào{" "}
                          <span className="font-bold">
                            {dayjs(review.createat).format("DD/MM/YYYY")}
                          </span>
                        </p>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Typography
                    variant="body1"
                    sx={{ gridColumn: "span 4", textAlign: "center" }}
                  >
                    Bạn chưa thực hiện đánh giá nào
                  </Typography>
                )}
              </div>
              {reviews.length > ITEMS_PER_PAGE && (
                <Pagination
                  count={Math.ceil(reviews.length / ITEMS_PER_PAGE)}
                  page={reviewPage}
                  onChange={handleReviewPageChange}
                  sx={{ mt: 2, alignSelf: "center" }}
                />
              )}
            </div>
          </div>
        </div>

        <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Thêm đánh giá
            </Typography>
            <Autocomplete
              options={pitches}
              getOptionLabel={(option) =>
                `Sân ${option.name} (sân ${
                  option.type === "FIVE_A_SIDE"
                    ? 5
                    : option.type === "SEVEN_A_SIDE"
                      ? 7
                      : 11
                })`
              }
              value={
                pitches.find((p) => p.pitchId === newReview.pitchId) || null
              }
              onChange={(event, newValue) =>
                setNewReview({
                  ...newReview,
                  pitchId: newValue?.pitchId || "",
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn sân"
                  fullWidth
                  sx={{ mb: 2 }}
                />
              )}
              disabled={
                !!newReview.pitchId &&
                pitches.some((p) => p.pitchId === newReview.pitchId)
              }
            />
            <TextField
              select
              label="Điểm đánh giá"
              value={newReview.rating}
              onChange={(e) =>
                setNewReview({ ...newReview, rating: Number(e.target.value) })
              }
              fullWidth
              sx={{ mb: 2 }}
              SelectProps={{ native: true }}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </TextField>
            <TextField
              label="Bình luận"
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
              fullWidth
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddSubmit}
              fullWidth
              disabled={!newReview.pitchId}
            >
              Hoàn tất
            </Button>
          </Box>
        </Modal>

        <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Sửa đánh giá
            </Typography>
            <TextField
              select
              label="Điểm đánh giá"
              value={editReview.rating}
              onChange={(e) =>
                setEditReview({ ...editReview, rating: Number(e.target.value) })
              }
              fullWidth
              sx={{ mb: 2 }}
              SelectProps={{ native: true }}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </TextField>
            <TextField
              label="Bình luận"
              value={editReview.comment}
              onChange={(e) =>
                setEditReview({ ...editReview, comment: e.target.value })
              }
              fullWidth
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleEditSubmit}
              fullWidth
            >
              Hoàn tất
            </Button>
          </Box>
        </Modal>

        <Modal open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Xóa đánh giá
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Bạn có chắc muốn xóa đánh giá này không?
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteSubmit}
              fullWidth
              sx={{ mb: 1 }}
            >
              Hoàn tất
            </Button>
            <Button
              variant="outlined"
              onClick={() => setOpenDeleteModal(false)}
              fullWidth
            >
              Hủy
            </Button>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default reviewHistory;
