"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  INITIAL_USERS,
  INITIAL_LAYANAN,
  INITIAL_JADWAL_DOKTER,
  INITIAL_JANJI_TEMU,
  INITIAL_CATATAN_PERAWATAN,
  INITIAL_SLOT_TERISI,
} from "@/lib/mockData";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isClient, setIsClient] = useState(false);

  // Real Authentication state (defaults to null if not logged in)
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [layanan, setLayanan] = useState(INITIAL_LAYANAN);
  const [jadwalDokter, setJadwalDokter] = useState(INITIAL_JADWAL_DOKTER);
  const [janjiTemu, setJanjiTemu] = useState(INITIAL_JANJI_TEMU);
  const [catatanPerawatan, setCatatanPerawatan] = useState(INITIAL_CATATAN_PERAWATAN);
  const [slotTerisi, setSlotTerisi] = useState(INITIAL_SLOT_TERISI);

  // Load from localStorage on client mount & listen to Firebase Auth
  useEffect(() => {
    setIsClient(true);
    try {
      const savedUser = localStorage.getItem("sr_active_user");
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedUsers = localStorage.getItem("sr_users");
      if (savedUsers) setUsers(JSON.parse(savedUsers));

      const savedLayanan = localStorage.getItem("sr_layanan");
      if (savedLayanan) setLayanan(JSON.parse(savedLayanan));

      const savedJadwal = localStorage.getItem("sr_jadwal");
      if (savedJadwal) setJadwalDokter(JSON.parse(savedJadwal));

      const savedJanji = localStorage.getItem("sr_janji");
      if (savedJanji) setJanjiTemu(JSON.parse(savedJanji));

      const savedCatatan = localStorage.getItem("sr_catatan");
      if (savedCatatan) setCatatanPerawatan(JSON.parse(savedCatatan));

      const savedSlot = localStorage.getItem("sr_slot");
      if (savedSlot) setSlotTerisi(JSON.parse(savedSlot));
    } catch (e) {
      console.warn("Storage sync error", e);
    }

    // Subscribe to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocSnap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.aktif !== false) {
              setCurrentUser(userData);
              saveState("sr_active_user", userData);
            } else {
              await signOut(auth);
              setCurrentUser(null);
              try {
                localStorage.removeItem("sr_active_user");
              } catch (e) {}
            }
          }
        } catch (e) {
          console.warn("Error fetching Firestore user profile:", e);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save changes to localStorage
  const saveState = (key, val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn(e);
    }
  };

  // Real Login with email & password (PRD Bab 4.1)
  const login = async ({ email, password }) => {
    const trimmedEmail = email.trim().toLowerCase();
    try {
      let firebaseUser;
      try {
        const userCred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        firebaseUser = userCred.user;
      } catch (authErr) {
        // Jika akun belum terdaftar di Firebase Auth tapi merupakan akun demo klinik PRD
        // (Andi, Maya, Laras, drg. Bima, drg. Sinta, Bu Ratna), otomatis daftarkan ke Firebase Auth
        const demoUser = INITIAL_USERS.find((u) => u.email.toLowerCase() === trimmedEmail);
        if (
          demoUser &&
          (authErr.code === "auth/user-not-found" ||
            authErr.code === "auth/invalid-credential" ||
            authErr.code === "auth/invalid-login-credentials")
        ) {
          const newCred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          firebaseUser = newCred.user;
          const profileData = {
            id: firebaseUser.uid,
            nama: demoUser.nama,
            email: demoUser.email,
            noHp: demoUser.noHp,
            role: demoUser.role,
            aktif: true,
            dibuatPada: new Date().toISOString(),
          };
          await setDoc(doc(db, "users", firebaseUser.uid), profileData);
        } else {
          throw authErr;
        }
      }

      // Ambil profil dari Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let profileData;
      if (userDocSnap.exists()) {
        profileData = userDocSnap.data();
      } else {
        const demoUser = INITIAL_USERS.find((u) => u.email.toLowerCase() === trimmedEmail);
        profileData = {
          id: firebaseUser.uid,
          nama: demoUser ? demoUser.nama : trimmedEmail.split("@")[0],
          email: trimmedEmail,
          noHp: demoUser ? demoUser.noHp : "",
          role: demoUser ? demoUser.role : "pasien",
          aktif: true,
          dibuatPada: new Date().toISOString(),
        };
        await setDoc(userDocRef, profileData);
      }

      if (profileData.aktif === false) {
        await signOut(auth);
        return { success: false, error: "Akun Anda dinonaktifkan. Hubungi klinik." };
      }

      setCurrentUser(profileData);
      saveState("sr_active_user", profileData);

      setUsers((prev) => {
        const exists = prev.some((u) => u.id === profileData.id);
        const updated = exists
          ? prev.map((u) => (u.id === profileData.id ? profileData : u))
          : [profileData, ...prev];
        saveState("sr_users", updated);
        return updated;
      });

      return { success: true, user: profileData };
    } catch (err) {
      console.error("Firebase Login Error:", err);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential" ||
        err.code === "auth/invalid-login-credentials" ||
        err.code === "auth/wrong-password"
      ) {
        return { success: false, error: "Email atau kata sandi tidak sesuai." };
      }
      if (err.code === "auth/too-many-requests") {
        return {
          success: false,
          error: "Terlalu banyak percobaan masuk yang gagal. Silakan coba lagi beberapa saat lagi.",
        };
      }
      return { success: false, error: err.message || "Gagal masuk." };
    }
  };

  // Real Google Sign In (PRD Bab 4.1)
  const loginWithGoogle = async () => {
    try {
      googleProvider.setCustomParameters({ prompt: "select_account" });
      const userCred = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCred.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let profileData;
      if (userDocSnap.exists()) {
        profileData = userDocSnap.data();
        if (profileData.aktif === false) {
          await signOut(auth);
          return { success: false, error: "Akun Anda dinonaktifkan. Hubungi klinik." };
        }
      } else {
        // Akun baru dibuat dengan role awal 'pasien' & noHp kosong (PRD Bab 2.2 & 4.1)
        profileData = {
          id: firebaseUser.uid,
          nama: firebaseUser.displayName || "Pasien Google",
          email: firebaseUser.email || "",
          noHp: "",
          role: "pasien",
          aktif: true,
          dibuatPada: new Date().toISOString(),
        };
        await setDoc(userDocRef, profileData);
      }

      setCurrentUser(profileData);
      saveState("sr_active_user", profileData);

      setUsers((prev) => {
        const exists = prev.some((u) => u.id === profileData.id);
        const updated = exists
          ? prev.map((u) => (u.id === profileData.id ? profileData : u))
          : [profileData, ...prev];
        saveState("sr_users", updated);
        return updated;
      });

      return { success: true, user: profileData };
    } catch (err) {
      console.error("Firebase Google Auth Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        return { success: false, error: "Jendela login Google ditutup sebelum selesai." };
      }
      if (err.code === "auth/popup-blocked") {
        return {
          success: false,
          error: "Pop-up login diblokir oleh peramban. Silakan izinkan pop-up untuk melanjutkan.",
        };
      }
      if (err.code === "auth/unauthorized-domain") {
        return {
          success: false,
          error: "Domain ini belum diotorisasi di Firebase Authentication Console.",
        };
      }
      return { success: false, error: err.message || "Gagal masuk dengan Google." };
    }
  };

  // Real Register new patient (PRD Bab 2.2 & 4.1)
  const register = async ({ nama, email, noHp, password }) => {
    const trimmedEmail = email.trim().toLowerCase();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const firebaseUser = userCred.user;

      const newProfile = {
        id: firebaseUser.uid,
        nama: nama.trim(),
        email: trimmedEmail,
        noHp: noHp.trim(),
        role: "pasien",
        aktif: true,
        dibuatPada: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), newProfile);

      setCurrentUser(newProfile);
      saveState("sr_active_user", newProfile);

      setUsers((prev) => {
        const updated = [newProfile, ...prev];
        saveState("sr_users", updated);
        return updated;
      });

      return { success: true, user: newProfile };
    } catch (err) {
      console.error("Firebase Register Error:", err);
      if (err.code === "auth/email-already-in-use") {
        return { success: false, error: "Email ini sudah terdaftar. Silakan langsung masuk." };
      }
      if (err.code === "auth/weak-password") {
        return { success: false, error: "Kata sandi minimal 6 karakter." };
      }
      return { success: false, error: err.message || "Gagal mendaftarkan akun." };
    }
  };

  // Logout (PRD Bab 2.2 & 6.2)
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out error", e);
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem("sr_active_user");
    } catch (e) {
      console.warn(e);
    }
  };

  // Update current user profile (nama & noHp)
  const updateProfile = async ({ nama, noHp }) => {
    if (!currentUser) return;
    const updatedCurr = { ...currentUser, nama, noHp };
    const updatedUsers = users.map((u) =>
      u.id === currentUser.id ? { ...u, nama, noHp } : u
    );

    try {
      await updateDoc(doc(db, "users", currentUser.id), { nama, noHp });
    } catch (e) {
      console.warn("Firestore sync warning on updateProfile:", e);
    }

    setUsers(updatedUsers);
    setCurrentUser(updatedCurr);
    saveState("sr_users", updatedUsers);
    saveState("sr_active_user", updatedCurr);
  };

  // Admin: Update user role / active status
  const updateUser = async (id, data) => {
    try {
      await updateDoc(doc(db, "users", id), data);
    } catch (e) {
      console.warn("Firestore sync warning on updateUser:", e);
    }

    const updated = users.map((u) => (u.id === id ? { ...u, ...data } : u));
    setUsers(updated);
    saveState("sr_users", updated);
    if (currentUser?.id === id) {
      const updatedCurr = { ...currentUser, ...data };
      setCurrentUser(updatedCurr);
      saveState("sr_active_user", updatedCurr);
    }
  };

  // Admin: Add or update Layanan
  const addLayanan = async (item) => {
    const newItem = {
      id: "lyn_" + Date.now(),
      ...item,
    };
    try {
      await setDoc(doc(db, "layanan", newItem.id), newItem);
    } catch (e) {
      console.warn("Firestore sync warning on addLayanan:", e);
    }

    const updated = [newItem, ...layanan];
    setLayanan(updated);
    saveState("sr_layanan", updated);
    return newItem;
  };

  const updateLayanan = async (id, data) => {
    try {
      await updateDoc(doc(db, "layanan", id), data);
    } catch (e) {
      console.warn("Firestore sync warning on updateLayanan:", e);
    }

    const updated = layanan.map((item) =>
      item.id === id ? { ...item, ...data } : item
    );
    setLayanan(updated);
    saveState("sr_layanan", updated);
  };

  // Admin: Add or delete Jadwal Dokter
  const addJadwalDokter = async (item) => {
    const newItem = {
      id: "jdw_" + Date.now(),
      ...item,
    };
    try {
      await setDoc(doc(db, "jadwal_dokter", newItem.id), newItem);
    } catch (e) {
      console.warn("Firestore sync warning on addJadwalDokter:", e);
    }

    const updated = [...jadwalDokter, newItem];
    setJadwalDokter(updated);
    saveState("sr_jadwal", updated);
    return newItem;
  };

  const deleteJadwalDokter = async (id) => {
    try {
      await deleteDoc(doc(db, "jadwal_dokter", id));
    } catch (e) {
      console.warn("Firestore sync warning on deleteJadwalDokter:", e);
    }

    const updated = jadwalDokter.filter((j) => j.id !== id);
    setJadwalDokter(updated);
    saveState("sr_jadwal", updated);
  };

  // Pasien: Buat janji baru
  const createJanji = async ({ pasienId, dokterId, layananId, tanggal, jam, keluhan }) => {
    const newId = "jnj_" + Date.now();
    const lyn = layanan.find((l) => l.id === layananId);
    const durasi = lyn ? lyn.durasiMenit : 30;

    const newJanji = {
      id: newId,
      pasienId: pasienId || currentUser?.id,
      dokterId,
      layananId,
      tanggal,
      jam,
      keluhan,
      status: "menunggu",
      alasanBatal: "",
      dibuatPada: new Date().toISOString(),
    };

    const newSlot = {
      id: newId,
      dokterId,
      tanggal,
      jam,
      durasiMenit: durasi,
    };

    try {
      await setDoc(doc(db, "janji_temu", newId), newJanji);
      await setDoc(doc(db, "slot_terisi", newId), newSlot);
    } catch (e) {
      console.warn("Firestore sync warning on createJanji:", e);
    }

    const updatedJanji = [newJanji, ...janjiTemu];
    const updatedSlot = [...slotTerisi, newSlot];

    setJanjiTemu(updatedJanji);
    setSlotTerisi(updatedSlot);
    saveState("sr_janji", updatedJanji);
    saveState("sr_slot", updatedSlot);

    return newJanji;
  };

  // Ubah status janji temu (Resepsionis / Dokter / Pasien)
  const updateJanjiStatus = async (id, newStatus, reason = "") => {
    const target = janjiTemu.find((j) => j.id === id);
    if (!target) return;

    try {
      await updateDoc(doc(db, "janji_temu", id), {
        status: newStatus,
        alasanBatal: reason || target.alasanBatal || "",
      });
      if (newStatus === "dibatalkan") {
        await deleteDoc(doc(db, "slot_terisi", id));
      }
    } catch (e) {
      console.warn("Firestore sync warning on updateJanjiStatus:", e);
    }

    const updatedJanji = janjiTemu.map((j) => {
      if (j.id === id) {
        return {
          ...j,
          status: newStatus,
          alasanBatal: reason || j.alasanBatal,
        };
      }
      return j;
    });

    let updatedSlot = slotTerisi;
    if (newStatus === "dibatalkan") {
      updatedSlot = slotTerisi.filter((s) => s.id !== id);
      setSlotTerisi(updatedSlot);
      saveState("sr_slot", updatedSlot);
    }

    setJanjiTemu(updatedJanji);
    saveState("sr_janji", updatedJanji);
  };

  // Resepsionis: Jadwal ulang janji
  const rescheduleJanji = async (id, newTanggal, newJam) => {
    const target = janjiTemu.find((j) => j.id === id);
    if (!target) return;

    try {
      await updateDoc(doc(db, "janji_temu", id), {
        tanggal: newTanggal,
        jam: newJam,
      });
      await updateDoc(doc(db, "slot_terisi", id), {
        tanggal: newTanggal,
        jam: newJam,
      });
    } catch (e) {
      console.warn("Firestore sync warning on rescheduleJanji:", e);
    }

    const updatedJanji = janjiTemu.map((j) => {
      if (j.id === id) {
        return {
          ...j,
          tanggal: newTanggal,
          jam: newJam,
        };
      }
      return j;
    });

    const updatedSlot = slotTerisi.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          tanggal: newTanggal,
          jam: newJam,
        };
      }
      return s;
    });

    setJanjiTemu(updatedJanji);
    setSlotTerisi(updatedSlot);
    saveState("sr_janji", updatedJanji);
    saveState("sr_slot", updatedSlot);
  };

  // Dokter: Tambah catatan perawatan dan tandai selesai
  const submitPemeriksaan = async (janjiId, tindakan, catatan) => {
    const j = janjiTemu.find((item) => item.id === janjiId);
    if (!j) return;

    const newCatId = "cat_" + Date.now();
    const newCatatan = {
      id: newCatId,
      janjiId: j.id,
      pasienId: j.pasienId,
      dokterId: j.dokterId,
      tindakan,
      catatan,
      dibuatPada: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "catatan_perawatan", newCatId), newCatatan);
    } catch (e) {
      console.warn("Firestore sync warning on submitPemeriksaan:", e);
    }

    const updatedCatatan = [newCatatan, ...catatanPerawatan];
    setCatatanPerawatan(updatedCatatan);
    saveState("sr_catatan", updatedCatatan);

    // Update status janji to 'selesai'
    await updateJanjiStatus(janjiId, "selesai");
  };

  // Reset to initial PRD mock state
  const resetData = () => {
    localStorage.clear();
    setCurrentUser(null);
    setUsers(INITIAL_USERS);
    setLayanan(INITIAL_LAYANAN);
    setJadwalDokter(INITIAL_JADWAL_DOKTER);
    setJanjiTemu(INITIAL_JANJI_TEMU);
    setCatatanPerawatan(INITIAL_CATATAN_PERAWATAN);
    setSlotTerisi(INITIAL_SLOT_TERISI);
  };

  return (
    <AppContext.Provider
      value={{
        isClient,
        authLoading,
        currentUser,
        login,
        loginWithGoogle,
        register,
        logout,
        users,
        layanan,
        jadwalDokter,
        janjiTemu,
        catatanPerawatan,
        slotTerisi,
        updateProfile,
        updateUser,
        addLayanan,
        updateLayanan,
        addJadwalDokter,
        deleteJadwalDokter,
        createJanji,
        updateJanjiStatus,
        rescheduleJanji,
        submitPemeriksaan,
        resetData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
