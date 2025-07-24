import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format, addDays, isToday } from "date-fns";
import { v4 as uuidv4 } from "uuid";

const SPACED_INTERVALS = [1, 3, 7, 14, 30];

function App() {
  const [lessons, setLessons] = useState([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [tag, setTag] = useState("");
  const [link, setLink] = useState("");
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState("default");

  useEffect(() => {
  const fetchInitialData = async () => {
    const querySnapshot = await getDocs(collection(db, "lessons"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLessons(data);
  };
  fetchInitialData();

  const unsubscribe = onSnapshot(collection(db, "lessons"), (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setLessons(data);
  });

  return () => unsubscribe();
}, []);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then(setNotificationPermission);
    }
    const interval = setInterval(() => {
      if (notificationPermission === "granted") {
        const todayLessons = lessons.filter((l) => isToday(new Date(l.nextReview)));
        if (todayLessons.length > 0) {
          new Notification("🍋 Bạn có " + todayLessons.length + " bài cần ôn hôm nay!");
        }
      }
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lessons, notificationPermission]);

  const addLesson = async () => {
  const newLesson = {
    title,
    note,
    tag,
    link,
    createdAt: new Date().toISOString(),
    status: "not reviewed",
    reviews: 0,
    nextReview: addDays(new Date(), 1).toISOString()
  };
  await addDoc(collection(db, "lessons"), newLesson);
  setTitle(""); setNote(""); setTag(""); setLink("");
};

  const markReviewed = async (id) => {
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) return;
  const nextInterval = SPACED_INTERVALS[Math.min(lesson.reviews + 1, SPACED_INTERVALS.length - 1)];
  await updateDoc(doc(db, "lessons", id), {
    status: "reviewed",
    reviews: lesson.reviews + 1,
    nextReview: addDays(new Date(), nextInterval).toISOString()
  });
};

  const resetReview = async (id) => {
  await updateDoc(doc(db, "lessons", id), {
    status: "not reviewed",
    reviews: 0,
    nextReview: addDays(new Date(), 1).toISOString()
  });
};

  const deleteLesson = async (id) => {
  await deleteDoc(doc(db, "lessons", id));
};

  const todayLessons = lessons.filter((l) => isToday(new Date(l.nextReview)));

  const filteredLessons = lessons.filter((l) =>
    (filterTag === "" || l.tag.toLowerCase().includes(filterTag.toLowerCase())) &&
    (l.title.toLowerCase().includes(search.toLowerCase()) || l.note.toLowerCase().includes(search.toLowerCase()))
  );

  const reviewedCount = lessons.filter((l) => l.status === "reviewed").length;
  const pendingCount = lessons.filter((l) => l.status === "not reviewed").length;

  return (
    <div className={`${darkMode ? 'bg-slate-900 text-white' : 'bg-sky-50 text-slate-700'} max-w-4xl mx-auto p-6 space-y-6 font-[Quicksand] min-h-screen`}>
      <div className="flex justify-center items-center relative">
        <h1 className="text-4xl font-bold text-yellow-400 text-center">🍋 Lemon Learn ☀️</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute right-0 text-sm transition hover:scale-[1.05]"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
      <p className="text-center italic text-sky-500">Sip your way to knowledge, one review at a time.</p>

      <Card className="bg-white dark:bg-slate-800 shadow-md rounded-2xl border border-yellow-100 dark:border-slate-700">
        <CardContent className="space-y-3 p-6">
          <Input placeholder="📘 Tên bài học" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl" />
          <Textarea placeholder="📝 Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-xl" />
          <Input placeholder="🔗 Link bài giảng / video" value={link} onChange={(e) => setLink(e.target.value)} className="w-full rounded-xl" />
          <Input placeholder="🏷️ Chủ đề / Tag" value={tag} onChange={(e) => setTag(e.target.value)} className="w-full rounded-xl" />
          <Button onClick={addLesson} className="w-full bg-yellow-100 hover:bg-yellow-300 text-slate-800 rounded-xl font-semibold">🍹 Lưu bài học</Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-yellow-400">📊 Thống kê</h2>
        <p>Tổng số bài học: {lessons.length}</p>
        <p>✅ Đã ôn: {reviewedCount} • ⏳ Chưa ôn: {pendingCount}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-yellow-400">📅 Bài cần ôn hôm nay</h2>
        {todayLessons.length === 0 && <p>🎉 Không có bài nào cần ôn hôm nay!</p>}
        {todayLessons.map((l) => (
          <Card key={l.id} className="border border-yellow-200 bg-yellow-100 dark:bg-yellow-200 rounded-2xl">
            <CardContent className="p-4 space-y-2 text-slate-800 dark:text-slate-100">
              <h3 className="font-bold text-lg text-yellow-600">☀️ {l.title}</h3>
              <p className="text-sm font-semibold px-2 py-1 inline-block bg-yellow-100 dark:bg-yellow-300 text-yellow-800 dark:text-slate-900 rounded-lg shadow-sm">#{l.tag}</p>
              <p>{l.note}</p>
              {l.link && <a href={l.link} className="text-blue-600 underline" target="_blank" rel="noreferrer">🔗 Xem bài giảng</a>}
              <div className="flex gap-2 mt-2">
                <Button className="bg-lime-300 hover:bg-lime-400 text-slate-800 px-3 py-1 text-sm rounded-lg" onClick={() => markReviewed(l.id)}>✅ Đã ôn</Button>
                <Button className="bg-amber-200 hover:bg-amber-300 text-slate-800 px-3 py-1 text-sm rounded-lg" onClick={() => resetReview(l.id)}>🔁 Cần ôn lại</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-yellow-400">📚 Danh sách bài học</h2>
        <div className="flex gap-2">
          <Input placeholder="🔍 Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-xl placeholder-slate-500 dark:placeholder-slate-300 w-full md:w-1/2" />
          <Input placeholder="🏷️ Lọc theo tag..." value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="rounded-xl placeholder-slate-500 dark:placeholder-slate-300 w-full md:w-1/2" />
        </div>
        {filteredLessons.length === 0 && <p className="text-sky-500">😶 Không tìm thấy bài học nào...</p>}
        {filteredLessons.map((l) => (
          <Card key={l.id} className="border border-yellow-100 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
            <CardContent className="p-4 space-y-2 text-slate-800 dark:text-slate-100">
              <h3 className="font-semibold text-lg text-yellow-500">📘 {l.title}</h3>
              <p className="text-sm font-semibold px-2 py-1 inline-block bg-yellow-100 dark:bg-yellow-300 text-yellow-800 dark:text-slate-900 rounded-lg shadow-sm">{l.tag} • Lưu ngày: {format(new Date(l.createdAt), 'dd/MM/yyyy')}</p>
              <p className="text-sm">Tình trạng: {l.status === "reviewed" ? "✅ Đã ôn" : "⌛ Chưa ôn"}</p>
              <p className="text-sm">Lần ôn tiếp theo: {format(new Date(l.nextReview), 'dd/MM/yyyy')}</p>
              {l.link && <a href={l.link} className="text-blue-500 underline text-sm" target="_blank" rel="noreferrer">🔗 Xem liên kết</a>}
              <div className="flex gap-2 mt-2">
                <Button className="bg-lime-300 hover:bg-lime-400 text-slate-800 px-3 py-1 text-sm rounded-lg" onClick={() => markReviewed(l.id)}>✅ Đã ôn</Button>
                <Button className="bg-amber-200 hover:bg-amber-300 text-slate-800 px-3 py-1 text-sm rounded-lg" onClick={() => resetReview(l.id)}>🔁 Cần ôn lại</Button>
                <Button className="bg-sky-300 hover:bg-sky-400 text-white px-3 py-1 text-sm rounded-lg" onClick={() => deleteLesson(l.id)}>🗑️ Xóa</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default App;
