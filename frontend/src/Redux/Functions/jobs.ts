"use client";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/Store";
import { openJobModal, closeJobModal } from "../Features/ApplyJobSlice";



export const useShowJobModal = () => {

  const dispatch = useDispatch<AppDispatch>();
  const isModalOpen = useSelector(
    (state: RootState) => state.applyJob.isModalOpen
  );

  const showJobModal = () => {
    dispatch(openJobModal());
  };

  const hideJobModal = () => {
    dispatch(closeJobModal());
  };


  return { isModalOpen, showJobModal, hideJobModal };
};
