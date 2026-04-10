import React, { useState, useEffect, useRef } from "react";

/* =========================
   物語アプリ（完全版・保存機能付き）
========================= */
function StoryApp({ goTop }: { goTop: () => void }) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const [works, setWorks] = useState<
    {
      id: string;
      title: string;
      summary: string;
      summaryOpen: boolean;
      stories: { id: string; title: string; summary: string; summaryOpen: boolean; content: string }[];
    }[]
  >(() => {
    const saved = localStorage.getItem("storyWorks");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "w1",
            title: "最初の作品",
            summary: "",
            summaryOpen: false,
            stories: [{ id: "s1", title: "第1話", summary: "", summaryOpen: false, content: "" }],
          },
        ];
  });

  const [currentWorkId, setCurrentWorkId] = useState<string | null>(null);
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);

  const currentWork = works.find((w) => w.id === currentWorkId);
  const currentStory = currentWork?.stories.find((s) => s.id === currentStoryId);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // ---------------- メニュー外クリックで閉じる ----------------
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!menuRef.current) return;
      const target = e.target as Node;
      if (!menuRef.current.contains(target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ---------------- 保存 ----------------
  useEffect(() => {
    localStorage.setItem("storyWorks", JSON.stringify(works));
  }, [works]);

  /* -------- 作品一覧 -------- */
  if (!currentWork) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={goTop}>← トップへ</button>
        <h1>作品一覧</h1>

        {works.map((w, i) => (
          <div
            key={w.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("i", String(i))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const from = Number(e.dataTransfer.getData("i"));
              if (from === i) return;
              const next = [...works];
              const [moved] = next.splice(from, 1);
              next.splice(i, 0, moved);
              setWorks(next);
            }}
            style={{ borderBottom: "1px solid #ccc", padding: 8 }}
          >
            <div style={{ display: "flex", alignItems: "center", position: "relative" }} ref={menuRef}>
              <span style={{ cursor: "grab", marginRight: 8 }}>≡</span>
              <span style={{ flex: 1, cursor: "pointer" }} onClick={() => setCurrentWorkId(w.id)}>
                {w.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === w.id ? null : w.id);
                }}
              >
                ⋯
              </button>

              {menuOpenId === w.id && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    border: "1px solid #ccc",
                    background: "#fff",
                    zIndex: 10,
                  }}
                >
                  <div
                    onClick={() => {
                      const t = prompt("作品タイトル", w.title);
                      if (t) {
                        w.title = t;
                        setWorks([...works]);
                      }
                      setMenuOpenId(null);
                    }}
                  >
                    編集
                  </div>
                  <div
                    style={{ color: "red" }}
                    onClick={() => {
                      if (works.length === 1) {
                        alert("作品は最低1つ必要です");
                        return;
                      }
                      setWorks(works.filter((x) => x.id !== w.id));
                      setMenuOpenId(null);
                    }}
                  >
                    削除
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={() =>
            setWorks([
              ...works,
              {
                id: Date.now().toString(),
                title: "タイトルを追加してください",
                summary: "",
                summaryOpen: false,
                stories: [{ id: Date.now().toString(), title: "第1話", summary: "", summaryOpen: false, content: "" }],
              },
            ])
          }
        >
          ＋ 追加
        </button>
      </div>
    );
  }

  /* -------- 話一覧 -------- */
  if (!currentStory) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={() => setCurrentWorkId(null)}>← 作品一覧へ</button>

        <h2>{currentWork.title}</h2>

        <button
          onClick={() => {
            currentWork.summaryOpen = !currentWork.summaryOpen;
            setWorks([...works]);
          }}
        >
          あらすじ
        </button>

        {currentWork.summaryOpen && (
          <textarea
          value={currentWork.summary}
          placeholder="作品あらすじ"
          onChange={(e) => {
            currentWork.summary = e.target.value;
            setWorks([...works]);
          }}
          onInput={autoResize}
          style={{ width: "100%", margin: "8px 0" }}
        />
        
        )}

        {currentWork.stories.map((s, i) => (
          <div
            key={s.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("i", String(i))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const from = Number(e.dataTransfer.getData("i"));
              if (from === i) return;
              const next = [...currentWork.stories];
              const [moved] = next.splice(from, 1);
              next.splice(i, 0, moved);
              currentWork.stories = next;
              setWorks([...works]);
            }}
            style={{ border: "1px solid #ccc", padding: 8, marginBottom: 6 }}
          >
            <div style={{ display: "flex", alignItems: "center", position: "relative" }} ref={menuRef}>
              <span style={{ cursor: "grab", marginRight: 8 }}>≡</span>
              <span style={{ flex: 1, cursor: "pointer" }} onClick={() => setCurrentStoryId(s.id)}>
                {s.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === s.id ? null : s.id);
                }}
              >
                ⋯
              </button>

              {menuOpenId === s.id && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    border: "1px solid #ccc",
                    background: "#fff",
                    zIndex: 10,
                  }}
                >
                  <div
                    onClick={() => {
                      const t = prompt("話タイトル", s.title);
                      if (t) {
                        s.title = t;
                        setWorks([...works]);
                      }
                      setMenuOpenId(null);
                    }}
                  >
                    編集
                  </div>
                  <div
                    style={{ color: "red" }}
                    onClick={() => {
                      if (currentWork.stories.length === 1) {
                        alert("話は最低1つ必要です");
                        return;
                      }
                      currentWork.stories = currentWork.stories.filter((x) => x.id !== s.id);
                      setWorks([...works]);
                      setMenuOpenId(null);
                    }}
                  >
                    削除
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            currentWork.stories.push({
              id: Date.now().toString(),
              title: "タイトル名を変更してください",
              summary: "",
              summaryOpen: false,
              content: "",
            });
            setWorks([...works]);
          }}
        >
          ＋ 追加話
        </button>
      </div>
    );
  }

  /* -------- 本文 -------- */
  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => setCurrentStoryId(null)}>← 話一覧へ</button>
      <h3>{currentStory.title}</h3>

      <textarea
  value={currentStory.content}
  onChange={(e) => {
    currentStory.content = e.target.value;
    setWorks([...works]);
  }}
  onInput={autoResize}
  style={{ width: "100%" }}
/>

      <div>文字数：{currentStory.content.length}</div>
    </div>
  );
}

/* =========================
   設定ページ
========================= */
function SettingApp({ goTop }: { goTop: () => void }) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const [works, setWorks] = useState<
    {
      id: string;
      title: string;
      summary: string;
      summaryOpen: boolean;
      stories: { id: string; title: string; summary: string; summaryOpen: boolean; content: string }[];
    }[]
  >(() => {
    const saved = localStorage.getItem("settingWorks");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "w1",
            title: "最初の設定",
            summary: "",
            summaryOpen: false,
            stories: [{ id: "s1", title: "第1項目", summary: "", summaryOpen: false, content: "" }],
          },
        ];
  });

  const [currentWorkId, setCurrentWorkId] = useState<string | null>(null);
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);

  const currentWork = works.find((w) => w.id === currentWorkId);
  const currentStory = currentWork?.stories.find((s) => s.id === currentStoryId);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!menuRef.current) return;
      const target = e.target as Node;
      if (!menuRef.current.contains(target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ---------------- 保存 ----------------
  useEffect(() => {
    localStorage.setItem("settingWorks", JSON.stringify(works));
  }, [works]);

  /* -------- 設定一覧・項目一覧・本文 -------- */
  if (!currentWork) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={goTop}>← トップへ</button>
        <h1>設定一覧</h1>

        {works.map((w, i) => (
          <div
            key={w.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("i", String(i))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const from = Number(e.dataTransfer.getData("i"));
              if (from === i) return;
              const next = [...works];
              const [moved] = next.splice(from, 1);
              next.splice(i, 0, moved);
              setWorks(next);
            }}
            style={{ borderBottom: "1px solid #ccc", padding: 8 }}
          >
            <div style={{ display: "flex", alignItems: "center", position: "relative" }} ref={menuRef}>
              <span style={{ cursor: "grab", marginRight: 8 }}>≡</span>
              <span style={{ flex: 1, cursor: "pointer" }} onClick={() => setCurrentWorkId(w.id)}>
                {w.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === w.id ? null : w.id);
                }}
              >
                ⋯
              </button>

              {menuOpenId === w.id && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    border: "1px solid #ccc",
                    background: "#fff",
                    zIndex: 10,
                  }}
                >
                  <div
                    onClick={() => {
                      const t = prompt("設定タイトル", w.title);
                      if (t) {
                        w.title = t;
                        setWorks([...works]);
                      }
                      setMenuOpenId(null);
                    }}
                  >
                    編集
                  </div>
                  <div
                    style={{ color: "red" }}
                    onClick={() => {
                      if (works.length === 1) {
                        alert("設定は最低1つ必要です");
                        return;
                      }
                      setWorks(works.filter((x) => x.id !== w.id));
                      setMenuOpenId(null);
                    }}
                  >
                    削除
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={() =>
            setWorks([
              ...works,
              {
                id: Date.now().toString(),
                title: "タイトルを追加してください",
                summary: "",
                summaryOpen: false,
                stories: [{ id: Date.now().toString(), title: "新しい項目", summary: "", summaryOpen: false, content: "" }],
              },
            ])
          }
        >
          ＋ 追加
        </button>
      </div>
    );
  }

  if (!currentStory) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={() => setCurrentWorkId(null)}>← 設定一覧へ</button>

        <h2>{currentWork.title}</h2>

        <button
          onClick={() => {
            currentWork.summaryOpen = !currentWork.summaryOpen;
            setWorks([...works]);
          }}
        >
          説明
        </button>

        {currentWork.summaryOpen && (
          <textarea
          value={currentWork.summary}
          placeholder="設定の説明"
          onChange={(e) => {
            currentWork.summary = e.target.value;
            setWorks([...works]);
          }}
          onInput={autoResize}
          style={{ width: "100%", margin: "8px 0" }}
        />        
        )}

        {currentWork.stories.map((s, i) => (
          <div
            key={s.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("i", String(i))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const from = Number(e.dataTransfer.getData("i"));
              if (from === i) return;
              const next = [...currentWork.stories];
              const [moved] = next.splice(from, 1);
              next.splice(i, 0, moved);
              currentWork.stories = next;
              setWorks([...works]);
            }}
            style={{ border: "1px solid #ccc", padding: 8, marginBottom: 6 }}
          >
            <div style={{ display: "flex", alignItems: "center", position: "relative" }} ref={menuRef}>
              <span style={{ cursor: "grab", marginRight: 8 }}>≡</span>
              <span style={{ flex: 1, cursor: "pointer" }} onClick={() => setCurrentStoryId(s.id)}>
                {s.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === s.id ? null : s.id);
                }}
              >
                ⋯
              </button>

              {menuOpenId === s.id && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    border: "1px solid #ccc",
                    background: "#fff",
                    zIndex: 10,
                  }}
                >
                  <div
                    onClick={() => {
                      const t = prompt("項目タイトル", s.title);
                      if (t) {
                        s.title = t;
                        setWorks([...works]);
                      }
                      setMenuOpenId(null);
                    }}
                  >
                    編集
                  </div>
                  <div
                    style={{ color: "red" }}
                    onClick={() => {
                      if (currentWork.stories.length === 1) {
                        alert("項目は最低1つ必要です");
                        return;
                      }
                      currentWork.stories = currentWork.stories.filter((x) => x.id !== s.id);
                      setWorks([...works]);
                      setMenuOpenId(null);
                    }}
                  >
                    削除
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            currentWork.stories.push({
              id: Date.now().toString(),
              title: "タイトル名を変更してください",
              summary: "",
              summaryOpen: false,
              content: "",
            });
            setWorks([...works]);
          }}
        >
          ＋ 追加ページ
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => setCurrentStoryId(null)}>← 項目一覧へ</button>
      <h3>{currentStory.title}</h3>

      <textarea
  value={currentStory.content}
  onChange={(e) => {
    currentStory.content = e.target.value;
    setWorks([...works]);
  }}
  onInput={autoResize}
  style={{ width: "100%" }}
/>

      <div>文字数：{currentStory.content.length}</div>
    </div>
  );
}

/* =========================
   言語アプリ
========================= */

type LangPage = "language" | "word" | "meaning" | "dynamic";

type Row = { id: string; left: string; right: string };
type DynamicWork = { id: string; title: string; stories: { id: string; title: string; content: string }[] };

function createId() { return Math.random().toString(36).slice(2); }
function load<T>(key: string, fallback: T): T {
  const d = localStorage.getItem(key);
  return d ? (JSON.parse(d) as T) : fallback;
}
function autoResize(e: React.FormEvent<HTMLTextAreaElement>) {
  const el = e.currentTarget;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

// -------------------- ListPage --------------------
function ListPage({
  title,
  addLabel,
  leftPlaceholder,
  rightPlaceholder,
  storageKey,
  onBack,
}: any) {
  const [rows, setRows] = useState<Row[]>(() =>
    load(storageKey, [{ id: createId(), left: "", right: "" }])
  );

  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState<"content" | "memo">("content");

  const [sortType, setSortType] = useState<"none" | "jp" | "az">("none");
  const [originalRows, setOriginalRows] = useState<Row[] | null>(null);

  const [isScrolled, setIsScrolled] = useState(false);

  // ---------------- 保存 ----------------
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(rows));
  }, [rows, storageKey]);

  // ---------------- 追加後スクロール ----------------
  useEffect(() => {
    if (!lastAddedId) return;
    const el = document.getElementById(lastAddedId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    setLastAddedId(null);
  }, [rows, lastAddedId]);

  // ✅ スクロールで縮小（2段階）
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---------------- 並び替え ----------------
  function sortRows(type: "jp" | "az") {
    if (sortType === type) {
      if (originalRows) setRows(originalRows);
      setSortType("none");
      setOriginalRows(null);
      return;
    }

    if (sortType === "none") {
      setOriginalRows(rows);
    }

    const sorted = [...rows].sort((a, b) => {
      const A = (a.left ?? "").trim();
      const B = (b.left ?? "").trim();

      if (type === "jp") {
        return A.localeCompare(B, "ja", {
          sensitivity: "base",
          numeric: true,
        });
      }

      return A.localeCompare(B, "en");
    });

    setRows(sorted);
    setSortType(type);
  }

  // ---------------- 検索 ----------------
  const filteredRows = rows.filter((row) => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return true;

    const target =
      searchMode === "memo"
        ? row.right.toLowerCase()
        : row.left.toLowerCase();

    return target.includes(keyword);
  });

  return (
    <div style={{ padding: 16 }}>
      {/* ================= 固定ヘッダー ================= */}
<div
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    background: "#fff",
    borderBottom: "1px solid #ccc",
    zIndex: 1000,
    transition: "all 0.25s ease",
    padding: isScrolled ? "10px 16px" : "28px 16px",
  }}
>
  <button onClick={onBack}>← 言語</button>

  <h2
    style={{
      margin: isScrolled ? "4px 0" : "12px 0",
      fontSize: isScrolled ? "18px" : "24px",
      transition: "all 0.25s ease",
    }}
  >
    {title}
  </h2>

  <div style={{ marginBottom: 6, display: "flex", gap: 6 }}>
    <input
      type="text"
      placeholder="🔎 検索..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        padding: isScrolled ? 4 : 6,
        fontSize: isScrolled ? 12 : 14,
        width: "100%",
        maxWidth: 240,
        borderRadius: 6,
        border: "1px solid #aaa",
      }}
    />
    <button onClick={() => setSearch("")}>✕</button>
  </div>

  <div style={{ marginBottom: 6 }}>
    <button
      onClick={() => setSearchMode("content")}
      style={{
        marginRight: 6,
        background: searchMode === "content" ? "#333" : "#eee",
        color: searchMode === "content" ? "#fff" : "#000",
      }}
    >
      📝 内容
    </button>

    <button
      onClick={() => setSearchMode("memo")}
      style={{
        background: searchMode === "memo" ? "#333" : "#eee",
        color: searchMode === "memo" ? "#fff" : "#000",
      }}
    >
      📎 メモ
    </button>
  </div>

  <div style={{ marginBottom: 6 }}>
    <button
      onClick={() => sortRows("jp")}
      style={{
        marginRight: 6,
        background: sortType === "jp" ? "#333" : "#eee",
        color: sortType === "jp" ? "#fff" : "#000",
      }}
    >
      🔤 五十音順
    </button>

    <button
      onClick={() => sortRows("az")}
      style={{
        background: sortType === "az" ? "#333" : "#eee",
        color: sortType === "az" ? "#fff" : "#000",
      }}
    >
      🔡 英字順
    </button>
  </div>

  <button
    onClick={() => {
      const id = createId();
      setRows([...rows, { id, left: "", right: "" }]);
      setLastAddedId(id);
    }}
  >
    ＋ {addLabel}
  </button>
</div>

{/* ヘッダーぶんの余白 */}
<div style={{ height: isScrolled ? 170 : 260 }} />
      
      {/* ================= リスト ================= */}
      {filteredRows.map((row, index) => (
        <div
          key={row.id}
          id={row.id}
          draggable
          onDragStart={(e) =>
            e.dataTransfer.setData("index", String(index))
          }
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const from = Number(e.dataTransfer.getData("index"));
            const next = [...rows];
            const [moved] = next.splice(from, 1);
            next.splice(index, 0, moved);
            setRows(next);
          }}
          style={{
            display: "flex",
            gap: 8,
            marginTop: 8,
            alignItems: "flex-start",
          }}
        >
          <span style={{ cursor: "grab" }}>≡</span>

          <textarea
            value={row.left}
            placeholder={leftPlaceholder}
            onChange={(e) =>
              setRows(
                rows.map((r) =>
                  r.id === row.id ? { ...r, left: e.target.value } : r
                )
              )
            }
            onInput={autoResize}
            style={{ flex: 1 }}
          />

          <textarea
            value={row.right}
            placeholder={rightPlaceholder}
            onChange={(e) =>
              setRows(
                rows.map((r) =>
                  r.id === row.id ? { ...r, right: e.target.value } : r
                )
              )
            }
            onInput={autoResize}
            style={{ flex: 1 }}
          />

          <div style={{ position: "relative" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(menuOpenId === row.id ? null : row.id);
              }}
            >
              ︙
            </button>

            {menuOpenId === row.id && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  background: "#fff",
                  border: "1px solid #ccc",
                  padding: 6,
                  zIndex: 10,
                }}
              >
                <div
                  style={{ color: "red", cursor: "pointer" }}
                  onClick={() => {
                    if (rows.length === 1) {
                      alert("最低1行必要です");
                      return;
                    }
                    setRows(rows.filter((r) => r.id !== row.id));
                    setMenuOpenId(null);
                  }}
                >
                  削除
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
// -------------------- DynamicApp --------------------
function DynamicApp({ onBack }: { onBack: () => void }) {
  const [works, setWorks] = useState<DynamicWork[]>(() =>
    load("dynamicWorks", [
      { id: createId(), title: "最初のダイナミック", stories: [{ id: createId(), title: "第1話", content: "" }] },
    ])
  );

  const [currentWorkId, setCurrentWorkId] = useState<string | null>(null);
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    const close = () => setMenuOpenId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const currentWork = works.find((w) => w.id === currentWorkId);
  const currentStory = currentWork?.stories.find((s) => s.id === currentStoryId);

  useEffect(() => {
    localStorage.setItem("dynamicWorks", JSON.stringify(works));
  }, [works]);

  if (!currentWork) {
    return (
      <div style={{ padding: 16 }}>
        <button onClick={onBack}>← 言語ページ</button>
        <h2>詳細一覧</h2>
        {works.map((w, index) => (
          <div
            key={w.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("index", String(index))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const from = Number(e.dataTransfer.getData("index"));
              const next = [...works];
              const [moved] = next.splice(from, 1);
              next.splice(index, 0, moved);
              setWorks(next);
            }}
            style={{ display: "flex", gap: 8, padding: 6, alignItems: "center", position: "relative" }}
          >
            <span style={{ cursor: "grab" }}>≡</span>
            <span style={{ flex: 1, cursor: "pointer", borderBottom: "1px solid #ccc" }} onClick={() => setCurrentWorkId(w.id)}>
              {w.title}
            </span>
            <div style={{ position: "relative" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === w.id ? null : w.id);
                }}
              >
                ︙
              </button>
              {menuOpenId === w.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ position: "absolute", right: 0, top: "100%", background: "#fff", border: "1px solid #ccc", display: "flex", gap: 8, padding: 6, zIndex: 10 }}
                >
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      const t = prompt("タイトル編集", w.title);
                      if (t) {
                        w.title = t;
                        setWorks([...works]);
                      }
                      setMenuOpenId(null);
                    }}
                  >
                    編集
                  </div>
                  <div
                    style={{ color: "red", cursor: "pointer" }}
                    onClick={() => {
                      if (works.length === 1) {
                        alert("最低1つは必要です");
                        return;
                      }
                      setWorks(works.filter((x) => x.id !== w.id));
                      setMenuOpenId(null);
                    }}
                  >
                    削除
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <button
          onClick={() =>
            setWorks([...works, { id: createId(), title: "タイトルを追加してください", stories: [{ id: createId(), title: "第1話", content: "" }] }])
          }
        >
          ＋ 追加
        </button>
      </div>
    );
  }

  if (!currentStory) {
    return (
      <div style={{ padding: 16 }}>
        <button onClick={() => setCurrentWorkId(null)}>← 詳細一覧</button>
        <h3>{currentWork.title}</h3>

        {currentWork.stories.map((s, index) => (
          <div
            key={s.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("index", String(index))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const from = Number(e.dataTransfer.getData("index"));
              const next = [...currentWork.stories];
              const [moved] = next.splice(from, 1);
              next.splice(index, 0, moved);
              currentWork.stories = next;
              setWorks([...works]);
            }}
            style={{ display: "flex", gap: 8, padding: 8, alignItems: "center", position: "relative", border: "1px solid #ddd", borderRadius: 4, marginTop: 6 }}
          >
            <span style={{ cursor: "grab" }}>≡</span>
            <span style={{ flex: 1, cursor: "pointer" }} onClick={() => setCurrentStoryId(s.id)}>
              {s.title}
            </span>
            <div style={{ position: "relative" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === s.id ? null : s.id);
                }}
              >
                ︙
              </button>
              {menuOpenId === s.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ position: "absolute", right: 0, top: "100%", background: "#fff", border: "1px solid #ccc", display: "flex", gap: 8, padding: 6, zIndex: 10 }}
                >
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      const t = prompt("話タイトル", s.title);
                      if (t) {
                        s.title = t;
                        setWorks([...works]);
                      }
                      setMenuOpenId(null);
                    }}
                  >
                    編集
                  </div>
                  <div
                    style={{ color: "red", cursor: "pointer" }}
                    onClick={() => {
                      if (currentWork.stories.length === 1) {
                        alert("最低1つは必要です");
                        return;
                      }
                      currentWork.stories = currentWork.stories.filter((x) => x.id !== s.id);
                      setWorks([...works]);
                      setMenuOpenId(null);
                    }}
                  >
                    削除
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <button
          onClick={() => {
            currentWork.stories.push({ id: createId(), title: "タイトル名を変更してください", content: "" });
            setWorks([...works]);
          }}
        >
          ＋ 追加タイトル
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <button onClick={() => setCurrentStoryId(null)}>← タイトル一覧</button>
      <h4>{currentStory.title}</h4>

      <textarea
  value={currentStory.content}
  onChange={(e) => {
    currentStory.content = e.target.value;
    setWorks([...works]);
  }}
  onInput={autoResize}
  style={{ width: "100%" }}
/>

      <div>文字数：{currentStory.content.length}</div>
    </div>
  );
}

/* =========================
   統合App
========================= */

export default function App() {
  const [page, setPage] = useState<LangPage | "top" | "story" | "setting">("top");

  if (page === "top") {
    return (
      <div style={{ padding: 20 }}>
        <h1>トップ画面</h1>
  
        <button
          onClick={() => setPage("story")}
          style={{ width: "100%", padding: "16px", fontSize: "18px" }}
        >
          物語
        </button>
  
        <br /><br />
  
        <button
          onClick={() => setPage("setting")}
          style={{ width: "100%", padding: "16px", fontSize: "18px" }}
        >
          設定
        </button>
  
        <br /><br />
  
        <button
          onClick={() => setPage("language")}
          style={{ width: "100%", padding: "16px", fontSize: "18px" }}
        >
          言語
        </button>
      </div>
    );
  }
  

  if (page === "story") return <StoryApp goTop={() => setPage("top")} />;
  if (page === "setting") return <SettingApp goTop={() => setPage("top")} />;

  if (page === "language") {
    return (
      <div style={{ padding: 16 }}>
        <button onClick={() => setPage("top")}>← トップへ</button>
        <h1>言語ページ</h1>

        <button onClick={() => setPage("word")}>単語</button>
        <br /><br />
        <button onClick={() => setPage("meaning")}>意味</button>
        <br /><br />
        <button onClick={() => setPage("dynamic")}>言語詳細</button>
      </div>
    );
  }

  if (page === "word") {
    return (
      <ListPage
        title="単語ページ"
        addLabel="追加欄"
        leftPlaceholder="単語"
        rightPlaceholder="メモ"
        storageKey="wordRows"
        onBack={() => setPage("language")}
      />
    );
  }

  if (page === "meaning") {
    return (
      <ListPage
        title="意味ページ"
        addLabel="追加欄"
        leftPlaceholder="意味"
        rightPlaceholder="メモ"
        storageKey="meaningRows"
        onBack={() => setPage("language")}
      />
    );
  }

  if (page === "dynamic") return <DynamicApp onBack={() => setPage("language")} />;

  return null;
}