import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, User, MessageSquare, ChevronRight, BookOpen, 
  Printer, FileText, HelpCircle, Send, Sliders, 
  Activity, Briefcase, AlertTriangle, Award, CheckCircle, FileSpreadsheet, Lightbulb, 
  Maximize2, Minimize2, Users, ChevronLeft, Clock, Target, Globe, Lock, Key, LogOut
} from 'lucide-react';

/* Choice Palette: Elegant Navy & Gold Harmony */
/* Application Structure Plan:
   - ログイン画面: abic / abic5980 認証に加え、Gemini APIキーのインプットをサポート。
   - トップページ: 顧客リスト (鈴木一郎様 & 山田花子様) を表示し、未稼働富裕層顧客へのアプローチ前の「気づき」を提供する。
   - 口座全体: 第一階層。口座資産の内訳、動的なポートフォリオ比率、AIの一言気づきアドバイスを表示。
   - 保有運用状況: 第二階層。長期保有ファンドのトータルリターン分析と、購入当時・現在を網羅する 3 カラム of 背景要因分析を表示。
     ★アップデート★：購入時からの「累積リターンの時系列推移」モーダルポップアップを、資産全体の鳥瞰に適した本ページ（Layer 2）へ移設統合！
   - 個別ファンド詳細: 第三階層。基準価額、純資産、パフォーマンス推移のチャートを統合的に描写。
     ★アップデート★：「商品分析シート」をクリックした際に、ファンド本来の商品特性を解説するサンプルポップアップを新規開発！
   - すべてのチャットは階層（タブ）ごとに完全に分離し、GA佐藤アドバイザーの「質的向上」のためにマクロ構造や顧客心理の深掘りに特化。
   - 【用語修正】いちよし証券様の実務に合わせ「コア・サテライト」を廃止。「中核運用（ベース資産）」および「積極運用（アクティブ・補完資産）」に表現を統一。
*/

// ==========================================
// 1. 完全リッチ化された顧客・ファンドデータ定義
// ==========================================

interface ChartDataItem {
  month: string;
  nav: number;
  tr: number;
  interestRate: number;
}

interface Fund {
  id: string;
  name: string;
  nickname: string;
  category: string;
  purchaseDate: string;
  purchasePrice: number;
  currentPrice: number;
  units: number;
  cost: number;
  currentValue: number;
  totalDistribution: number;
  totalReturn: number;
  trRate: number;
  purchaseEnv: string;
  customerExpectation: string;
  envDifference: string;
  description: string;
  policyDetail: string;
  settlementDay: string;
  netAssets: string;
  returns: {
    y1: number | null;
    y3: number | null;
    y5: number | null;
    y10: number | null;
  };
  investmentTarget: string;
  investmentPolicy: string;
  distributionPolicy: string;
  chartData: ChartDataItem[];
}

interface AssetCategory {
  name: string;
  value: number;
  cost: number;
  gain: number;
  color: string;
}

interface Customer {
  id: string;
  name: string;
  age: number;
  segment: string;
  lastContact?: string;
  policy: string;
  insightSummary: string;
  assets: {
    total: number;
    totalCost: number;
    gainLoss: number;
    categories: AssetCategory[];
  };
  funds: Fund[];
}

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface ChatMessagesState {
  layer1: ChatMessage[];
  layer2: ChatMessage[];
  layer3: ChatMessage[];
}

const customersData: Customer[] = [
  {
    id: "CUST-7089",
    name: "鈴木 一郎",
    age: 74,
    segment: "富裕層（未稼働・リレーション途絶中）",
    lastContact: "2022年10月（約3年 8ヶ月前）",
    policy: "中長期分散投資による安定運用、インカムゲイン重視",
    insightSummary: "分配金受取による『実質プラス』と残高報告書の『評価損表記』のギャップを紐解くのがリレーション回復の核心。",
    assets: {
      total: 35020000, 
      totalCost: 31100000,
      gainLoss: 3920000, 
      categories: [
        { name: "投資信託", value: 12520000, cost: 11500000, gain: 1020000, color: "#3B82F6" }, 
        { name: "国内株式", value: 8500000, cost: 6000000, gain: 2500000, color: "#10B981" },  
        { name: "国内債券", value: 5000000, cost: 5100000, gain: -100000, color: "#6366F1" },  
        { name: "外貨建債券", value: 4000000, cost: 3500000, gain: 500000, color: "#F59E0B" },  
        { name: "MRF・現預金", value: 5000000, cost: 5000000, gain: 0, color: "#EC4899" }       
      ]
    },
    funds: [
      {
        id: "FUND-INDIA", 
        name: "ニッセイ・インド債券オープン（毎月決算型）",
        nickname: "インド債券オープン",
        category: "海外債券（毎月決算型・為替ヘッジなし）",
        purchaseDate: "2021年8月",
        purchasePrice: 10000, currentPrice: 11500, units: 6000000, cost: 6000000, currentValue: 6900000,
        totalDistribution: 1440000, totalReturn: 2340000, trRate: 39.0,
        purchaseEnv: "2021年8月。新興国の中でもとりわけ高成長を維持するインド経済に着目。主要先進国の金利が底這うなか, 現地の高利回りな国債・社債のキャリー利回りを狙い、安定的な毎月インカム確保のために設定されたファンド。",
        customerExpectation: "「急成長するインド of 公社債公募金利を享受したい」「世界の超低金利下で、少しでも毎月の分配実績に弾みをつけたい」というインカム主導の期待感で購入。",
        envDifference: "購入後、米国FRBが1980年代以来の急激な利上げ（0%→5.25%超）を断行。債券価格自体は下落したものの、同時にインドルピー高・円安効果がクッションとなり, 実質トータルリターンは+39.0%（+234万円）のパフォーマンスを継続。積極運用部分（国内中小型株など）のマイナス要素を完全に補う中核運用（ベース）資産となっています。",
        description: "主としてインドの国債、政府機関債、州政府債、社債等に投資を行い, 高水準の利息収入の確保と信託財産の中長期的な成長を目指します。",
        policyDetail: "毎月15日に決算を行い、原則として利子配当等収益を中心に分配方針に従って分配金を払い出します。為替ヘッジは原則として行いません。",
        settlementDay: "毎月15日（休業日の場合は翌営業日）", 
        netAssets: "540 億円",
        returns: { y1: 8.5, y3: 14.2, y5: null, y10: null }, 
        investmentTarget: "インドの国債、政府機関債、州政府債、社債等（インカム源の最大化に主眼）",
        investmentPolicy: "信用力の高いインドの国債等に分散投資。新興国ならではの高い金利を毎月の分配原資（インカム）として安定蓄積しつつ、ルピーの経済ファンダメンタルズ向上にともなう長期の為替上昇益（キャピタル）の双方を狙います。",
        distributionPolicy: "毎月15日に決算を行い、分配対象原資から収益分配方針に則って、安定的な毎月の分配金（インカム）の受け取りを重視して払い出します。",
        chartData: [
          { month: "21/08", nav: 10000, tr: 10000, interestRate: 4.00 },
          { month: "21/11", nav: 10100, tr: 10200, interestRate: 4.00 },
          { month: "22/02", nav: 9950,  tr: 10250, interestRate: 4.00 },
          { month: "22/05", nav: 9700,  tr: 10150, interestRate: 5.40 },
          { month: "22/08", nav: 10200, tr: 10800, interestRate: 5.40 },
          { month: "22/11", nav: 10350, tr: 11100, interestRate: 5.40 },
          { month: "23/02", nav: 10100, tr: 11050, interestRate: 6.25 },
          { month: "23/05", nav: 10500, tr: 11600, interestRate: 6.25 },
          { month: "23/08", nav: 10600, tr: 11900, interestRate: 6.25 },
          { month: "23/11", nav: 10850, tr: 12350, interestRate: 6.50 },
          { month: "24/02", nav: 11000, tr: 12650, interestRate: 6.50 },
          { month: "24/05", nav: 10900, tr: 12700, interestRate: 6.50 },
          { month: "24/08", nav: 11100, tr: 13100, interestRate: 6.50 },
          { month: "24/11", nav: 11300, tr: 13450, interestRate: 6.50 },
          { month: "25/02", nav: 11250, tr: 13550, interestRate: 6.50 },
          { month: "25/05", nav: 11450, tr: 13900, interestRate: 6.50 },
          { month: "25/08", nav: 11400, tr: 14000, interestRate: 6.50 },
          { month: "25/11", nav: 11350, tr: 14050, interestRate: 6.25 },
          { month: "26/02", nav: 11500, tr: 14170, interestRate: 6.25 },
          { month: "26/03", nav: 11500, tr: 14170, interestRate: 6.25 }
        ]
      },
      {
        id: "FUND-B",
        name: "いちよし・グローバル好配当株式ファンド（年6回決算型）",
        nickname: "ミズナラ",
        category: "海外株式（成長・インカム資産）",
        purchaseDate: "2024年6月",
        purchasePrice: 10000, currentPrice: 11200, units: 4000000, cost: 4000000, currentValue: 4480000,
        totalDistribution: 420000, totalReturn: 900000, trRate: 22.5,
        purchaseEnv: "2024年6月。利上げピークアウト意識。米国ハイテク株主導からバリュー株への見直しが入った時期。新NISA開始後の投資マインド向上期。",
        customerExpectation: "「世界の優良配当企業への分散投資による安定成長」「隔月決算でのインカム享受」を期待。",
        envDifference: "想定通り世界的な株高 and 円安トレンドが継続し、基準価額が12%上昇。累計42万円の分配金と合わせ、22.5%の極めて良好なリターンを記録中。顧客接点での「成功体験」の共有に最適。",
        description: "主として日本を除く world 各国の好配当株、および成長性が高く配当の伸びが期待できる企業（増配企業）の株式に投資を行い、信託財産の成長と安定した収益 of 獲得を目指します。",
        policyDetail: "奇数月の毎月20日に決算を行い、分配対象額の範囲内から分配方針に基づいて分配を行います。為替ヘッジは原則として行いません。",
        settlementDay: "奇数月20日（年6回）", netAssets: "139 億円",
        returns: { y1: 15.4, y3: null, y5: null, y10: null }, 
        investmentTarget: "日本を除く世界各国の好配当株、および高い成長余力を有する先進国・新興国の優良株式（増配株中心）",
        investmentPolicy: "増配や業績成長が見込まれるグローバル企業を厳選し、持続的な株価値上がり（キャピタルゲイン）と, 配当成長（インカム）の手腕の複利効果の双方を享受するバランス運用を実践します。",
        distributionPolicy: "奇数月の毎月20日（年6回）に決算を行い、配当等収益や売買益等を原資として分配方針に従って分配を行います。",
        chartData: [
          { month: "24/06", nav: 10000, tr: 10000, interestRate: 5.50 },
          { month: "24/08", nav: 10150, tr: 10250, interestRate: 5.50 },
          { month: "24/10", nav: 10300, tr: 10500, interestRate: 5.00 },
          { month: "24/12", nav: 10800, tr: 11100, interestRate: 4.50 },
          { month: "25/02", nav: 11100, tr: 11500, interestRate: 4.50 },
          { month: "25/04", nav: 11200, tr: 11720, interestRate: 4.50 },
          { month: "25/06", nav: 11100, tr: 11700, interestRate: 4.25 },
          { month: "25/08", nav: 11050, tr: 11800, interestRate: 4.00 },
          { month: "25/10", nav: 11150, tr: 12000, interestRate: 4.00 },
          { month: "25/12", nav: 11300, tr: 12250, interestRate: 3.75 },
          { month: "26/02", nav: 11200, tr: 12250, interestRate: 3.50 },
          { month: "26/03", nav: 11200, tr: 12250, interestRate: 3.50 }
        ]
      },
      {
        id: "FUND-C",
        name: "中小型株アクティブオープン",
        nickname: "IAM中小型アクティブ",
        category: "国内株式（積極運用・アクティブ）", 
        purchaseDate: "2021年10月",
        purchasePrice: 15000, currentPrice: 11400, units: 1500000, cost: 1500000, currentValue: 1140000,
        totalDistribution: 160000, totalReturn: -200000, trRate: -13.3,
        purchaseEnv: "2021年10月。コロナ後の経済再開期待で国内中小型成長株が活況を呈していた時期。マザーズ市場等の成長株が歴史的高水準にあった過熱期。",
        customerExpectation: "「いちよしの得意分野である中小型株での高成長」「積極運用枠での値上がり益」を期待。", 
        envDifference: "購入直後, マザーズ指数をはじめとする国内中小型グロース市場が急落。バリュー株相場への移行により長期低迷。トータルリターン is -13.3%と苦戦中。このファンドの「今現在の見通し」を誠実に説明することが、鈴木様との信頼回復のキーとなる。",
        description: "わが国の金融商品取引所に上場されている株式のうち、独自の技術力やビジネスモデルを有し、高い成長が期待できる中小型株式を主要投資対象とし、アクティブに運用します。",
        policyDetail: "毎年10月25日に決算を行い、分配を行います。",
        settlementDay: "毎年10月25日（年 1回）", netAssets: "85 億円",
        returns: { y1: -2.1, y3: -12.4, y5: null, y10: null }, 
        investmentTarget: "わが国の金融商品取引所に上場されている株式のうち、独自の技術力やニッチな高成長ビジネスモデルを有する『中小型グロー株式』",
        investmentPolicy: "いちよし独自の徹底した中小型企業ボトムアップ調査を背景に, 将来の主要中核企業へと成長する可能性の高い企業を早期に発掘し、集中投資による高パフォーマンス獲得を目指します（アクティブ運用）。",
        distributionPolicy: "毎年10月25日に決算を行い、基準価額の水準、将来の成長力等を総合的に勘案して分配対象額 of 範囲内から分配を行います。",
        chartData: [
          { month: "21/10", nav: 15000, tr: 15000, interestRate: -0.10 },
          { month: "22/01", nav: 13800, tr: 13800, interestRate: -0.10 },
          { month: "22/04", nav: 12100, tr: 12100, interestRate: -0.10 },
          { month: "22/07", nav: 12300, tr: 12400, interestRate: -0.10 },
          { month: "22/10", nav: 11800, tr: 12000, interestRate: -0.10 },
          { month: "23/01", nav: 11200, tr: 11400, interestRate: -0.10 },
          { month: "23/04", nav: 11500, tr: 11750, interestRate: -0.10 },
          { month: "23/07", nav: 11100, tr: 11350, interestRate: -0.10 },
          { month: "23/10", nav: 10900, tr: 11200, interestRate: -0.10 },
          { month: "24/01", nav: 11300, tr: 11600, interestRate: -0.10 },
          { month: "24/04", nav: 11400, tr: 11750, interestRate: 0.10 },
          { month: "24/07", nav: 11150, tr: 11500, interestRate: 0.10 },
          { month: "24/10", nav: 11200, tr: 11550, interestRate: 0.25 },
          { month: "25/01", nav: 11450, tr: 11800, interestRate: 0.25 },
          { month: "25/04", nav: 11500, tr: 11900, interestRate: 0.25 },
          { month: "25/07", nav: 11200, tr: 11600, interestRate: 0.25 },
          { month: "25/10", nav: 11100, tr: 11500, interestRate: 0.25 },
          { month: "26/01", nav: 11300, tr: 11700, interestRate: 0.50 },
          { month: "26/03", nav: 11400, tr: 11800, interestRate: 0.50 }
        ]
      }
    ]
  },
  {
    id: "CUST-9921",
    name: "山田 花子",
    age: 58,
    segment: "準富裕層（未稼働・リレーション途絶中）", 
    policy: "長期保有の毎月分配型投信の分配金をプールした多額 of MRF現金を保有。長年のコンタクト途絶から信頼を再構築するための足がかりを模索中", 
    insightSummary: "約20年前からお持ちの『グロイン』『リート』の分配金（計750万円）はMRFに蓄積。元本割れの印象を覆し, 長年の信頼関係をさらに深める折の絶好機。",
    assets: {
      total: 18000000, 
      totalCost: 14500000,
      gainLoss: 3500000, 
      categories: [
        { name: "投資信託", value: 2390000, cost: 8000000, gain: -5610000, color: "#3B82F6" }, 
        { name: "国内株式", value: 3000000, cost: 2500000, gain: 500000, color: "#10B981" },  
        { name: "国内債券", value: 1000000, cost: 1000000, gain: 0, color: "#6366F1" },       
        { name: "MRF・現預金", value: 11610000, cost: 3000000, gain: 8610000, color: "#EC4899" } 
      ]
    },
    funds: [
      {
        id: "FUND-PICTET",
        name: "ピクテ・グローバル・インカム株式ファンド（毎月分配型）",
        nickname: "グロイン",
        category: "海外株式・公益高配当（インカム枠）",
        purchaseDate: "2007年1月",
        purchasePrice: 10000, currentPrice: 3100, units: 5000000, cost: 5000000, currentValue: 1550000,
        totalDistribution: 4800000, totalReturn: 1350000, trRate: 27.0,
        purchaseEnv: "2007年1月。リーマンショック前夜。世界の高金利環境でグローバルな公益株式（電力、ガス、水道等）への投資が絶大な支持を誇っていた最盛期。",
        customerExpectation: "「インフラ公益企業だから安定している」「毎月高い分配金が生活資金の確実な足しになる」という期待。",
        envDifference: "世界のマーケット局面の激動にさらされたが、分配金（480万円）を長期回収し続けた結果、トータルリターンは+27.0%のプラス。",
        description: "世界の高配当公益株を主要投資対象とし、安定的なインカムと中長期的な成長を目指します。",
        policyDetail: "毎月15日に決算を行い、分配対象額 of 範囲内から分配方針に基づいて分配を行います。為替ヘッジは原則行いません。",
        settlementDay: "毎月10日", 
        netAssets: "9,800 億円",
        returns: { y1: 5.1, y3: 12.3, y5: 24.5, y10: 45.8 }, 
        investmentTarget: "世界各国の高配当インフラ・公益株式（電力、ガス、水道, 電気通信、廃棄物処理関連など）",
        investmentPolicy: "人々の生活に不可欠であり、景気後退局面でも安定的な利用料金収入（ディフェンシブ性）が確保できる世界の好配当公益株式へ厳選投資。長年培われた高いインカム獲得力を武器に複利的な成長を目指します。",
        distributionPolicy: "毎月10日に決算を行い、原則として配当金などのインカム収入をベースに, 毎月の収益分配方針に則って安定的・継続的な現金分配を行うよう運用されます。",
        chartData: [
          { month: "07/01", nav: 10000, tr: 10000, interestRate: 5.25 },
          { month: "11/01", nav: 4500,  tr: 6800,  interestRate: 0.25 },
          { month: "15/01", nav: 5800,  tr: 9200,  interestRate: 0.25 },
          { month: "19/01", nav: 4200,  tr: 9800,  interestRate: 2.50 },
          { month: "20/01", nav: 4100,  tr: 10200, interestRate: 1.75 },
          { month: "21/01", nav: 4000,  tr: 10500, interestRate: 0.25 },
          { month: "22/01", nav: 3900,  tr: 11000, interestRate: 0.25 },
          { month: "22/07", nav: 3750,  tr: 11150, interestRate: 2.50 },
          { month: "23/01", nav: 3400,  tr: 11500, interestRate: 4.50 },
          { month: "23/07", nav: 3300,  tr: 11800, interestRate: 5.25 },
          { month: "24/01", nav: 3250,  tr: 12100, interestRate: 5.50 },
          { month: "24/07", nav: 3200,  tr: 12350, interestRate: 5.50 },
          { month: "25/01", nav: 3150,  tr: 12500, interestRate: 4.75 },
          { month: "25/07", nav: 3120,  tr: 12600, interestRate: 4.50 },
          { month: "26/03", nav: 3100,  tr: 12700, interestRate: 4.25 }
        ]
      },
      {
        id: "FUND-REIT", 
        name: "グローバル・リートオープン（世界の大家さん）",
        nickname: "世界の大家さん",
        category: "海外REIT・毎月分配（インカム枠）",
        purchaseDate: "2009年11月",
        purchasePrice: 10000, currentPrice: 2800, units: 3000000, cost: 3000000, currentValue: 840000,
        totalDistribution: 2700000, totalReturn: 540000, trRate: 18.0,
        purchaseEnv: "2009年11月。リーマンショック後の世界的な超金融緩和期。預金金利が消滅する中で、不動産の安定家賃を原資とする新しいインカム源として支持を獲得した時期。",
        customerExpectation: "「世界の不動産の大家さんになって、毎月安定した家賃収入を得たい」「低金利下での着実なキャッシュフロー」を期待。",
        envDifference: "急激な利上げで基準価額は調整したが、17年近くにわたり受け取った累計分配金により、トータルでは+18.0%のプラス運用を維持。",
        description: "日本を除く世界各国の不動産投資信託（REIT）に分散投資を行います。",
        policyDetail: "毎月決算。配当等収益や値上がり益を原資として毎月分配を行います。",
        settlementDay: "毎月15日", netAssets: "3,200 億円",
        returns: { y1: -4.5, y3: 8.2, y5: 12.4, y10: 22.1 }, 
        investmentTarget: "日本を除く世界各国の不動産投資信託（REIT）の受益証券等（商業ビル、物流施設、ホテル、住宅等）",
        investmentPolicy: "世界中の優良な実物不動産から得られる安定的な家賃収入を、REITファンドを通じて長期回収します。世界不動産市場の成長成果をインカム還元するポートフォリオです。",
        distributionPolicy: "毎月15日に決算を行い、実物不動産の家賃に相当する配当等分配金を、毎月安定的に山田様の手元口座（MRF）に還流することを目指します。",
        chartData: [
          { month: "09/11", nav: 10000, tr: 10000, interestRate: 0.25 },
          { month: "13/11", nav: 6200,  tr: 8800,  interestRate: 0.25 },
          { month: "17/11", nav: 5400,  tr: 9600,  interestRate: 1.25 },
          { month: "21/11", nav: 4100,  tr: 10800, interestRate: 0.10 },
          { month: "22/05", nav: 3900,  tr: 10900, interestRate: 1.00 },
          { month: "22/11", nav: 3500,  tr: 10950, interestRate: 4.00 },
          { month: "23/05", nav: 3200,  tr: 11100, interestRate: 5.25 },
          { month: "23/11", nav: 3100,  tr: 11300, interestRate: 5.50 },
          { month: "24/05", nav: 3000,  tr: 11450, interestRate: 5.50 },
          { month: "24/11", nav: 2950,  tr: 11600, interestRate: 4.75 },
          { month: "25/05", nav: 2900,  tr: 11700, interestRate: 4.50 },
          { month: "26/03", nav: 2800,  tr: 11800, interestRate: 4.25 }
        ]
      }
    ]
  }
];

// ==========================================
// 2. メインAppコンポーネント
// ==========================================

export default function App() {
  // 認証・システム用State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginUser, setLoginUser] = useState<string>("");
  const [loginPass, setLoginPass] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");

  // ナビゲーション・表示用State
  const [view, setView] = useState<string>('list'); 
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'layer1' | 'layer2' | 'layer3'>('layer1'); 
  const [selectedFundId, setSelectedFundId] = useState<string>('');
  
  // チャットメッセージステート（階層別管理）
  const [chatMessages, setChatMessages] = useState<ChatMessagesState>({
    layer1: [],
    layer2: [],
    layer3: []
  });
  
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showReportPreview, setShowReportPreview] = useState<boolean>(false);
  const [isReportFullScreen, setIsReportFullScreen] = useState<boolean>(true);
  
  // 各ポップアップの表示制御ステート
  const [showReturnAnalysisModal, setShowReturnAnalysisModal] = useState<boolean>(false);
  const [showProductAnalysisModal, setShowProductAnalysisModal] = useState<boolean>(false); 

  const contentScrollRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedFund = currentCustomer?.funds?.find(f => f.id === selectedFundId) || currentCustomer?.funds?.[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab, isTyping]);

  useEffect(() => {
    const handleScrollToTop = () => {
      if (contentScrollRef.current) contentScrollRef.current.scrollTop = 0;
      if (chatScrollRef.current) chatScrollRef.current.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    handleScrollToTop();
    const delayTimer = setTimeout(handleScrollToTop, 30);
    return () => clearTimeout(delayTimer);
  }, [activeTab, view, currentCustomer]);

  // ログイン処理
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === "abic" && loginPass === "abic5980") {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("ユーザー名またはパスワードが間違っています。");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginUser("");
    setLoginPass("");
    setView('list');
    setCurrentCustomer(null);
  };

  function getPresetQuestions() {
    if (!currentCustomer) return [];
    if (activeTab === 'layer1') {
      return [
        { label: `${currentCustomer.name}様の今の心理状態・不安を読み解く`, q: `${currentCustomer.name}様の現在の資産構成から読み取れる、お客様の今の心理状態（不安や誤解 of ポイント）と、対話テーブルにつくための気づきの観点を教えてください。` },
        { label: "未稼働期間の市場変動が口座に与えた構造的影響", q: `約4年間コンタクトがない間に起きた大きな金利・為替の変動が、${currentCustomer.name}様の保有資産（投信・債券）にどのような構造的影響を与えたか解説してください。` }
      ];
    } else if (activeTab === 'layer2') {
      return [
        { label: "評価損益とトータルリターンの乖離を解明する", q: `保有中の「${selectedFund?.name || 'ファンド'}」について, 基準価額下落と受取分配金を合わせたトータルリターンがプラスになっている「金融市場の仕組み」をGA自身が納得できるよう論理的に解説してください。` },
        { label: "買付時と現在における市場金利環境のギャップ", q: `${currentCustomer.name}様がこのファンドを購入された当時と、現在のマーケット環境の「決定的な違い」を整理し、GAが対話前に押さえておくべきポイントをまとめてください。` }
      ];
    } else {
      return [
        { label: "運用チャートに見る金利パフォーマンス of 背景", q: `個別ファンド「${selectedFund?.nickname || 'ファンド'}」の運用成績チャートから、政策金利 of 上下動がファンドパフォーマンスを左右した論理的な背景構造を教えてください。` },
        { label: "本来の投資方針との一貫性を再検証する", q: `${currentCustomer.name}様の元々のご意向（ベース・成長/積極運用の使い分け）に対して、現在の保有ファンドの位置づけが本当に合致しているかをGAとしてどう捉えればよいか、気づきの視点を提示してください。` }
      ];
    }
  }

  function handleSelectCustomer(customer: Customer) {
    setCurrentCustomer(customer);
    setSelectedFundId(customer.funds[0].id);
    setView('dashboard');
    setActiveTab('layer1');
    
    setChatMessages({
      layer1: [
        { sender: 'ai', text: `グロース・アドバイザー（GA）支援AIアシスタントです。【口座全体】の情報を同期しました。\n\n${customer.name}様の全体状況から「何が対話の心理的な障壁になっているか」を深く知り、コミュニケーションのきっかけを得るための気づきをアシストします。`, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
      ],
      layer2: [
        { sender: 'ai', text: `【保有運用状況】専用分析チャットです。${customer.name}様が各商品を購入された「当時の市場環境」と「その後の歴史」を比較・抽出し、表面的なマイナスイメージを解きほぐすためのマクロ的な気づき提供します。`, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
      ],
      layer3: [
        { sender: 'ai', text: `【個別ファンド詳細】専用対話チャットです。商品特性や金利環境の変化が運用に与えた構造的な仕組みについて、プロフェッショナルな気づきを提供します。`, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
      ]
    });
  }

  function handlePresetClick(question: string) { 
    handleSendMessage(question); 
  }

  async function handleSendMessage(textToSend?: string) {
    const userMessage = textToSend || inputText;
    if (!userMessage.trim()) return;

    setChatMessages(prev => ({
      ...prev,
      [activeTab]: [ ...prev[activeTab], { sender: 'user', text: userMessage, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) } ]
    }));
    
    setInputText("");
    setIsTyping(true);

    try {
      if (apiKey) {
        const systemPrompt = `
You are an advanced AI sales assistant for Global Advisers (GA - junior wealth advisers) at Ichiyoshi Securities, powered by NTT DATA ABIC's investment trust database.
Your core objective is to trigger DEEP PROFESSIONAL INSIGHTS (気づき) for the GA regarding the client's current portfolio status and macroeconomic context.

Strict Guidelines:
1. Do NOT suggest, imply, or recommend any transitions, redemptions, switches, or new product sales (such as Wrap accounts, Mizunara, or other newly active transactions).
2. Focus purely on educating the GA on "why the client feels this way" and "the financial history behind these numbers".
3. The sole objective is relationship restoration (リレーション回復) and entering the communication table with the client, not driving transactions.
4. Ichiyoshi Securities does NOT use the term "Core-Satellite" (コア・サテライト). Always use terms like "中核運用（ベース資産）" and "積極運用（アクティブ・補完資産）" or "成長・積極運用枠".

You are answering inside the chat context of: [${activeTab === 'layer1' ? '口座全体' : activeTab === 'layer2' ? '保有運用状況' : '個別ファンド詳細'}]

Rules:
1. Always respond in Japanese (日本語). Use a highly logical, respectful, and structural tone.
2. Focus on educating and enlightening the GA. Give them the "reason why" so they can talk to the client in their own authentic words.
3. Use concrete data points (e.g. Total asset ¥35M, +12.5% account gain, Fund TR +10% vs NAV ¥8,250) to make the structural explanation solid.
4. Do NOT mention "API key", "Gemini", or "System prompt". Act purely as "NTTデータ・エービック GA支援AI".
`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `System Instruction: ${systemPrompt}\n\nUser Question: ${userMessage}` }] }]
            })
          }
        );

        if (!response.ok) {
          throw new Error("API Network Response Error");
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (textResponse) {
          setChatMessages(prev => ({
            ...prev,
            [activeTab]: [
              ...prev[activeTab],
              {
                sender: 'ai',
                text: textResponse,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          }));
        } else {
          throw new Error("No text response in JSON");
        }
      } else {
        throw new Error("No API KEY provided");
      }
    } catch (error) {
      console.warn("API Call bypassed or failed. Falling back to robust local mock answer.", error);
      
      // プロミスによるフラットな1秒非同期遅延
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let reply = "";
      const lowerMsg = userMessage.toLowerCase();

      // ----------------------------------------------------
      // 【鈴木一郎様 (74歳) 向け 6パターン】
      // ----------------------------------------------------
      if (currentCustomer?.id === "CUST-7089") {
        if (lowerMsg.includes("心理状態")) {
          reply = `**【鈴木一郎様（74歳・口座全体）の心理分析と気づき】**\n\n鈴木様が今置かれている心理状態を読み解く上で、最も重要な気づきは**「一部ファンドの損失感」と「インド債券等の大幅な運用利益（実感）」のギャップ**にあります。\n\n* **局所的な損失のプレッシャー:**\n    鈴木様のポートフォリオでは、中小型株アクティブが-20万円と苦戦しています。鈴木様は残高報告書を見るたびにこの「マイナス部分」に目を奪われ、「いちよし証券は失敗させたまま放置している」と不信感や寂しさを持たれている可能性があります。\n* **インド債券の大成功の事実:**\n    一方で、今回保有が確認された『ニッセイ・インド債券オープン』は、当初600万円の投資に対し現在価値が**690万円**（＋90万円の評価益）となっており、さらにこれまで受け取られた分配金の累計は**144万円**に上ります。トータルリターンは実質**＋234万円（＋39.0%）**という驚異的な大成功を収めています。\n* **アドバイザーとしての質的気づき:**\n    鈴木様に寄り添うための第一歩は、商品を売り込むことではなく、この「実は中核運用であるインド債券が信じられないほどの高いリターンを生み、積極運用枠の損失を完全に補って余りある成果を上げている」という事実を誠実にお伝えすることです。鈴木様の総預かり資産は3,502万円、累計損益は＋594万円と、資産全体では圧倒的に成功しています。まずこの安心を共有することから対話をスタートさせましょう。`;
        } 
        else if (lowerMsg.includes("構造的影響")) {
          reply = `**【鈴木様：沈黙期（2022年〜現在）におけるマクロ環境変動 of 構造的影響】**\n\n鈴木様とコンタクトが途絶えていた期間中における、世界とインド市場の構造変動について解説します。\n\n* **米金金利急騰ショック期とインド債券の耐性:**\n    2022年以降、米国FRBが史上最速のペースで「0% ➔ 5.25%超」への利上げを断行しました。金リが急上昇したことで、世界的な債券価格の下落を招き、鈴木様のポートフォリオにもマイナス圧力がかかりました。しかし、新興国の中でも圧倒的な高成長（GDP成長率年7%超）を維持するインド国債・社債 of 堅牢な高金利インカムが, 価格下落を強力に下支えしました。\n* **為替の大幅なルピー高・円安シフト（最強の盾効果）:**\n    さらに、日米金利差の広がりから、通貨インドルピーが対円で著しく上昇（大幅なルピー高・円安）しました。鈴木様のファンドは「為替ヘッジなし」であったため、ドル高・ルピー高メリットを100%享受し、金利によるクーポン蓄積と合算してトータルリターン＋39.0%という最高水準の利益を叩き出す結果となりました。\n* **国内中小型グロース株の低迷要因:**\n    鈴木様の積極運用部分（中小型株アクティブ：現在-20万）が低迷した背景には、マザーズ市場の長期低迷と、東証主要バリュー株（高配当株など）への市場マネーの一方的な集中があります。これは特定の運用成績というより、国内株 of 急激なセクターシフトによる一時的な構造変化によるものです。`;
        } 
        else if (lowerMsg.includes("乖離")) {
          reply = `**【インド債券オープン：トータルリターン＋39%（＋234万円）を達成した金融的仕組み】**\n\n鈴木様が保有する「ニッセイ・インド債券オープン」は, 基準価額そのものが上昇（10,000円 ➔ 11,500円）していることに加え、累計分配金144万円が上乗せされ、トータルリターン＋39.0%（＋234万円）と極めて優秀な実績を上げています。\n\n* **仕組み1：新興国ならではの「高クーポン」による先行回収**\n    インド国債は年6〜7%台という先進国を圧倒する高い金利を提供し続けています。この高い利子収入（インカム）が、毎月決算ごとに鈴木様のMRFへ確実に吐き出され、累計**144万円**として確定保全されました。\n* **仕組み2：為替ヘッジコスト「回避」とルピー高メリット**\n    鈴木様のファンドは「為替ヘッジなし」であったため、日米金利差拡大にともなうドル高・新興国通貨高・円安の恩恵をダイレクトに受けることができました。ヘッジコスト（年5%超の支払）を一切払うことなく、為替差益をすべて基準価額（＋90万円）に上乗せすることができた成果です。\n* **総括:**\n    『新興国の高い金利収入の蓄積』に『長期の実質為替差益』が掛け算された, 分散インカム投資としてこれ以上ない理想的な運用構造です。`;
        } 
        else if (lowerMsg.includes("決定的な違い")) {
          reply = `**【鈴木様：購入当時（2021年8月）と現在（2026年6月）の決定的な違い】**\n\n鈴木様が「インド債券オープン」をご購入された時期と現在では、世界の金利環境の局面が「真逆（サイクル反転）」となっています。\n\n* **購入当時（2021年8月）：利上げの「前夜（底）」**\n    * **金利位置:** 米国金利はゼロ金利（0.25%）であり、これ以上金利が下がらない状態でした。その後, 米国の急激な利上げショックにより、新興国債券を含む世界の債券市場全体が価格調整（逆風）を迎える, スタート地点としては厳しい時期でした。\n* **現在（2026年6月）：利下げの「初期（天井からの低下局面）」**\n    * **金利位置:** 米金利は5.25%超のピークを打ち、今後はインフレ低下にともなって緩やかな「利下げサイクル」へと入っていく局面です（現在4.25%前後）。\n    * **保有の好機:** 金利が低下に転じると、過去の利回りの高い債券が市場で人気化するため、既発 of 債券価格は物理的に上昇します。つまり、これまでは「金利急上昇で耐える時期」だったのが、これからは「金利低下に伴う基準価額そのものの見直し（キャピタルゲイン獲得）」が狙える、最高の後風 of 時期へシフトしたことを意味します。`;
        } 
        else if (lowerMsg.includes("金利パフォーマンス")) {
          reply = `**【インド債券オープン：金利の推移とトータルリターンの相関関係】**\n\n詳細チャート（SVGグラフ）から, インド現地の金利推移と鈴木様のトータル利益の推移から、驚くべき「資産保護の構造」が読み取れます。\n\n* **世界債券ショック期（2021/08 〜 2023/08）:**\n    米国の急激な利上げショックにより、世界中のソブリン債が暴落した時期、インド債券オープンの基準価額（点線）はインドルピー高の為替盾効果により、逆に「¥10,000 ➔ ¥10,600」と底堅く推移しました。さらに、受け取った毎月の分配金（インカム）がクッションとなり、トータル成果（青い太線）は「¥11,800」へと確実な上昇トレンドを描きました。\n* **金利高止まり・収穫期（2024/08 〜 現在）:**\n    現地の金利が高い水準（6%台）で維持されたことで, ファンド内に蓄積されるクーポンの果実が最大化。トータルリターン（青い太線）は「¥12,900 ➔ ¥14,170」へと放物線を描くように急上昇を続けました。高金利をキャリー収益として蓄積し、為替の追い風を掴むことで、いかに強固な資産防衛（インカム投資）が達成されたかがチャート上で視覚的に一目瞭然です。`;
        } 
        else if (lowerMsg.includes("投資方針")) {
          reply = `**【鈴木様：元々のご意向と現在保有商品の整合性に関する質的評価】**\n\n鈴木様のご意向は「中長期分散投資による安定運用、インカムゲイン重視」です。鈴木様のポートフォリオの整合性を, 商品特性から改めて客観的に評価しましょう。\n\n* **ニッセイ・インド債券（毎月分配）：意向との一貫性＝【極めて高】**\n    鈴木様が「定期預金より高い利回り、安定分配」を望まれたことに対し、当ファンドはインドの高格付け国債等に広く分散し、過去最悪 of 利上げショックを乗り越え、累計144万円の現金分配と、＋234万円という口座トップの運用成果を生み出しました。鈴木様のご意向に最も深く沿っている「エース（ベース資産）」です。\n* **ミズナラ（世界好配当株・隔月）：意向との一貫性＝【高】**\n    世界の好配当企業に投資し、隔月でインカムを得る設計。現在のTR is ＋22.5％（＋90万円）。こちらも鈴木様のポリシーに合致した成長・インカム資産と言えます。\n* **中小型株アクティブ（国内株）：意向との一貫性＝【低〜中】（積極運用）**\n    高成長を期待した積極運用部分（現在-20万円）は、鈴木様の「インカムと安定」の本来の軸からはブレたアグレッシブな補完的位置づけです。\n* **アドバイザーとしての総括:**\n    鈴木様が「積極運用部分のマイナス20万円」にのみ捉われている場合、ポートフォリオ本来の中核部分が歪んで見えてしまいます。お預かり額 of 80%以上を占める主力部分（インド債券＋ミズナラ）が、実質的には＋324万円以上（234万＋90万）の圧倒的な利益を鈴木様に運んできているという事実に気づき、まずそれを共有して信頼を回復することが何よりの鍵となります。`;
        }
      } 
      // ----------------------------------------------------
      // 【山田花子様 (58歳) 向け 6パターン】
      // ----------------------------------------------------
      else if (currentCustomer?.id === "CUST-9921") {
        if (lowerMsg.includes("心理状態")) {
          reply = `**【山田花子様（58歳・未稼働リレーション途絶）の心理状態と気づき】**\n\n山田様は、約20年前から『グロイン』、放置状態だった『世界の大家さん（リート）』を保有されています。残高表記の評価損（表面）から「大損した」と悔やまれている可能性が非常に高いです。\n\n* **残高表記による「失敗感」の蓄積:**\n    残高明細上の投資信託評価額は, グロイン（155万円）と世界の大家さん（84万円）を合わせて合計239万円と, 投資元本800万円に対して大幅に元本割れ（マイナス561万円）しているように見えます。そのため、山田様は「やはり投資信託は失敗だった、いちよし証券は損をさせたまま放置している」と失望されている可能性が非常に高いです。\n* **プールされた750万円の蓄積資産:**\n    しかし実際は、約20年の間に受け取った累計分配金は合計で**750万円**（グロイン480万＋世界の大家さん270万）に達しており、これらは日常のMRF現預金口座に100%蓄積・保全されています。評価額239万円にこの分配金を合算した本当のトータル成果は**1,800万円（＋350万円 of 純増大成功）**です。\n* **アドバイザーとしての質的気づき:**\n    未稼働の山田様にコンタクトを取る第一歩は、この「失われた評価額」が実は「現金の形で安全に手元に還流・先行回収されていた」という中核運用の仕組みを解きほぐすことです。「これまでの投資は, 資産全体で大成功していた」という客観的事実を共有し, 誤解を安心に変えて信頼関係を再構築しましょう。`;
        } 
        else if (lowerMsg.includes("構造的影響")) {
          reply = `**【山田様：未稼働沈黙期におけるマクロ環境変動の構造的影響】**\n\n山田様が保有する2つのインカム型ファンド（グロイン＆世界の大家さん）の背景にある金融市場の出来事を整理します。\n\n1. **ピクテ・グローバル・インカム（グロイン）：**\n   * リーマンショック、欧州危機、利上げ環境をまたぎましたが、投資先の電力・ガスなどのグローバル公益企業は、景気後退局面でも安定的なインカム（利用料金収入）を確保し、分配原資を出し続けました。\n2. **グローバル・リート（世界の大家さん）：**\n   * 2009年購入。世界的な超低金利継続（金利低下はリートに追い風）の恩恵を長く享受。その後の急激な利上げ期で一時的に調整しましたが、分配金（累計270万）が全体を強力に支えています。\n\n**■ コミュニケーション上の気づき:**\n山田様の評価損への気後れは、市場の変化を「点」で見ているためです。20年近い「分配金蓄積の歴史」を線で結びつけ, これまでの運用の確かな意味を一緒に解きほぐすことが対話の出発点となります。`;
        } 
        else if (lowerMsg.includes("乖離")) {
          reply = `**【世界の大家さん：評価損なのにトータルでプラスになっている金融構造】**\n\n山田様が保有する『グローバル・リート（世界の大家さん）』は, 基準価額が単体では¥2,800と元本割れしているように見えながら、トータルリターンは＋18.0%（＋54万円）と資産成長に貢献しています。この仕組みを解説します。\n\n* **仕組み1：元本部分の「先行回収」と生活口座（MRF）還流**\n    毎月分配型投信は, 市場の上昇・下落にかかわらず、ファンドが得た不動産REIT of 家賃収入を現金の形で山田様の預金・MRFに毎月還流させました。結果として、**投資した300万円のうち270万円はすでに手元の安全な口座に「利益およびキャッシュバック」として回収済み**となっています。市場の下落にさらされている実質的なリスク元本は、現在わずか84万円分にまで減っている、という高い安全性への気づきが重要です。\n* **仕組み2：投資先リートが有する「不動産実質価値」の下支え**\n    20年近くもの間に、インフレや急激な利上げが何度も起きましたが、投資先である世界各国の好立地オフィスや商業施設などは「インフレに合わせて賃料を引き上げる」ことができる実質的な裏付け資産を持っていたため、運用会社は分配金を安定して出し続けることができました。`;
        } 
        else if (lowerMsg.includes("決定的な違い")) {
          reply = `**【山田様：購入当時と現在（2026年6月）のマーケット決定的な違い】**\n\n山田様がファンドを購入された約17年前の時期と現在では、世界の「金利環境」や「アプローチの局面」において、前提が劇的に異なります。\n\n* **決定的な違い1：長年の運用経過による資金蓄積と、リバランス移行へのタイミング**\n    * **当時:** 40代前半。まだ手元資金 of インカム回収が始まったばかりでした。\n    * **現在:** 長年にわたり分配金をプールし続けた結果、MRFキャッシュ（現預金）に1,161万円ものまとまった安全資産が手つかずで眠っています。このキャッシュを、ベース資産へリバランス移行するための素晴らしい足がかりとなる重要な時期を迎えています。\n* **決定的な違い2：金利環境 of 局面変化**\n    * これまで長い間, 低金利が持続してリートや公益インカムを支えてきましたが、現在はインフレと高金利からの緩やかな低下局面に入っています。このマクロ環境の決定的な変化をGA佐藤さんが理解しておくことが、対話への備えとなります。`;
        } 
        else if (lowerMsg.includes("金利パフォーマンス")) {
          reply = `**【世界の大家さん：公益インフラ・REITチャートにおける金利との相関性】**\n\n世界の大家さん（世界のリート）のパフォーマンス推移から、金利変動が商品に与えた影響をチャートから読み取ります。\n\n* **低金利継続期（2011年 〜 2021年）の黄金サイクル:**\n    世界的にゼロ金利が長く継続したこの期間、基準価額（点線）は非常にマイルドに推移し、一方でトータルリターン（青い太線）は「分配金の毎月受取り」が完全にエンジンとなって右肩上がりに大きく伸長しました。市場に金利がないため、リートの生み出す「約3〜5% of インカム」に人気が殺到した恩恵です。\n* **急激な利上げ期（2022年 〜 2025年）の重石:**\n    米金利がゼロから5%超に急上昇した期間、リートや公益株も「金利対比でのバリュエーションの悪化」および「借入金コスト増」を嫌気され、基準価額が¥4,100から¥2,800へと大きく調整しました。\n* **今後の利下げ局面への気づき:**\n    現在, 利下げサイクルへ移行しつつ、金利低下によってリートやインフラ公益株の基準価額は底打ちします。まさに「今, 価格が回復し始めているタイミング」だからこそ、損失感を和らげ、これまでの運用経過をご説明するのに最適な潮目であることをチャートが示しています。`;
        } 
        else if (lowerMsg.includes("投資方針")) {
          reply = `**【山田様：ポートフォリオの整合性および成長投資移行検証】**\n\n山田様の現状 of 不整合と、今後の整合性について検証します。\n\n* **現在の構成 of 不整合：極端なキャッシュの眠り（MRF 1,161万円 / リート・グロイン 239万円）**\n    これまで20年間インカムを蓄積し続けた結果、お預かり資産1,800万円のうち約65%に相当する1,161万円が「MRF（現預金）」に超低金利で眠ってしまっています。これは素晴らしい安全財産ですが、現預金のままで放置することは将来のインカム獲得を望む山田様のご意向から、やや非効率な状態（不整合）になりつつあります。\n* **リレーションのゴール:**\n    山田様が「投信は失敗だった」と誤解されている部分を, トータルリターンレポート（＋135万、＋54万）で誠実に紐解き, これまでの中核運用の歩みの正しさを伝えること。それにより、「大損した」というネガティブな感情を安心感へと転換させ、信頼関係をさらに深めることが最大の目的です。`;
        }
      }

      setChatMessages(prev => ({
        ...prev,
        [activeTab]: [
          ...prev[activeTab],
          {
            sender: 'ai',
            text: reply || `ご質問ありがとうございます。\nお尋ねの件について、${currentCustomer?.name}様のポートフォリオ特性（中核運用と積極運用の使い分け、購入当時の利上げ環境ギャップ）に基づき、アドバイザーとしての深い気づきを持って鈴木様・山田様のアプローチ準備に繋げていく材料としてください。`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }));
    } finally {
      setIsTyping(false); 
    }
  }

  // チャットデータからY・X座標を自動計算
  const getChartCoords = () => {
    if (!selectedFund || !selectedFund.chartData || selectedFund.chartData.length === 0) {
      return { navPath: '', trPath: '', points: [], maxVal: 0, minVal: 0 };
    }
    const vals = selectedFund.chartData.flatMap(d => [d.nav, d.tr]);
    const maxVal = Math.max(...vals);
    const minVal = Math.min(...vals);
    const yRange = (maxVal - minVal) || 1000;
    const points = selectedFund.chartData.map((d, i) => {
      const x = 50 + (i * (600 / (selectedFund.chartData.length - 1)));
      const yNav = 135 - ((d.nav - minVal) * (115 / yRange));
      const yTr = 135 - ((d.tr - minVal) * (115 / yRange));
      return { x, yNav, yTr, month: d.month, interestRate: d.interestRate };
    });
    return { 
      navPath: points.map((p,i)=>`${i===0?'M':'L'} ${p.x} ${p.yNav}`).join(' '), 
      trPath: points.map((p,i)=>`${i===0?'M':'L'} ${p.x} ${p.yTr}`).join(' '), 
      points, 
      maxVal, 
      minVal 
    };
  };

  const chartInfo = getChartCoords();

  // 時系列インカム還流データ動的生成
  const getTimelineAnalysisData = () => {
    if (!selectedFund) return null;
    
    const fundId = selectedFund.id;
    if (fundId === "FUND-INDIA") {
      return {
        title: "「インド債券オープン」時系列リターン分析シミュレーション",
        desc: "設定来約4年半にわたり、基準価額が金利高ショック等で上下動を繰り返しながらも、高利息インカム（年1万口あたり最高年500〜700円規模 of 分配金額）の長期的累積とルピー高効果により、鈴木様の資産が着実に保全・成長してきた軌跡を分析します。",
        columns: ["運用期間", "基準価額 (円/1万口)", "分配金受取累計 (円/1万口)", "トータル評価価値 (円/1万口)", "鈴木様の実質リターン"],
        rows: [
          { period: "買付当初 (21/08)", nav: "10,000円", dist: "0円", total: "10,000円", yieldRate: "±0.0% (元本：600万円)" },
          { period: "1年経過 (22/08)", nav: "10,200円", dist: "500円", total: "10,700円", yieldRate: "+7.0% (+42万円)" },
          { period: "2年経過 (23/08)", nav: "10,600円", dist: "1,200円", total: "11,800円", yieldRate: "+18.0% (+108万円)" },
          { period: "3年経過 (24/08)", nav: "11,100円", dist: "1,800円", total: "12,900円", yieldRate: "+29.0% (+174万円)" },
          { period: "現在 (26/03)", nav: "11,500円", dist: "2,670円", total: "14,170円", yieldRate: "+41.7% (+250.2万円)" }
        ],
        gaAdvice: "「残高上の評価（11,500円）だけでも購入元本を超えていますが、特筆すべきは過去4年半にわたり毎月鈴木様のMRFへ払い戻された分配金累計が、元本の約24%（144万円）に達している点です。中核ベース資産としての安全性と先行回収力をビジュアルを交えてお伝えしてください」"
      };
    } else if (fundId === "FUND-PICTET") {
      return {
        title: "「ピクテ・グローバル・インカム」時系列リターン分析シミュレーション",
        desc: "2007年1月のお買付から約19年にわたり、数々の世界ショック（リーマンショック、ギリシャ危機、コロナ等）をまたぎつつ、電力・ガス等の公益企業の安定的な『利用料金収入』を原資とするインカムが、驚異的な現金を山田様の口座へもたらし続けた軌跡を分析します。",
        columns: ["経過段階", "基準価額 (円/1万口)", "分配金受取累計 (円/1万口)", "トータル評価価値 (円/1万口)", "山田様の実質リターン"],
        rows: [
          { period: "買付当初 (2007/01)", nav: "10,000円", dist: "0円", total: "10,000円", yieldRate: "±0.0% (元本：500万円)" },
          { period: "4年経過 (2011/01)", nav: "4,500円", dist: "2,300円", total: "6,800円", yieldRate: "-32.0% (リーマンショックの底)" },
          { period: "8年経過 (2015/01)", nav: "5,800円", dist: "3,400円", total: "9,200円", yieldRate: "-8.0% (実質的な復調傾向)" },
          { period: "12年経過 (2019/01)", nav: "4,200円", dist: "5,600円", total: "9,800円", yieldRate: "-2.0% (累積インカムによる保全)" },
          { period: "現在 (2026/03)", nav: "3,100円", dist: "9,600円", total: "12,700円", yieldRate: "+27.0% (+135万円の純増大成功)" }
        ],
        gaAdvice: "「基準価額が3,100円まで下がったため、お客様の残高報告書上の投信残高は155万円に激減し『投信は失敗だった』という強い不信感が生まれています。しかし実際には、480万円の分配金が現預金（MRF）として手元に先行回収されています。実質135万円（＋27％）の大成功であったという時系列の線をお伝えするだけで、お客様の表情は劇的に安心へと変化します」"
      };
    } else if (fundId === "FUND-REIT") {
      return {
        title: "「世界の大家さん」時系列リターン分析シミュレーション",
        desc: "2009年のリーマンショック直後の預金金利消滅期にお買付。以来17年にわたり、世界不動産（REIT）の実質的な「家賃収入」を毎月回収し、MRF（現預金口座）へ安定的にプールし続けたことによる、強固なインカム防衛の軌跡を紐解きます。",
        columns: ["経過段階", "基準価額 (円/1万口)", "分配金受取累計 (円/1万口)", "トータル評価価値 (円/1万口)", "山田様の実質リターン"],
        rows: [
          { period: "買付当初 (2009/11)", nav: "10,000円", dist: "0円", total: "10,000円", yieldRate: "±0.0% (元本：300万円)" },
          { period: "4年経過 (2013/11)", nav: "6,200円", dist: "2,600円", total: "8,800円", yieldRate: "-12.0% (低金利下での高い還元)" },
          { period: "8年経過 (2017/11)", nav: "5,400円", dist: "4,200円", total: "9,600円", yieldRate: "-4.0% (着実なリスク引き下げ)" },
          { period: "12年経過 (2021/11)", nav: "4,100円", dist: "6,700円", total: "10,800円", yieldRate: "+8.0% (+24万円の利益)" },
          { period: "現在 (2026/03)", nav: "2,800円", dist: "9,000円", total: "11,800円", yieldRate: "+18.0% (+54万円の純増大成功)" }
        ],
        gaAdvice: "「投資元本300万円に対し、手元評価額は84万円と激減しているように見えます。しかし、すでに元本の90%に相当する270万円が現金（分配金）として手元に戻っており、実質的なリスク資産はわずか30万円分にまで縮小されています。この『投資先不動産の確実な家賃先行回収実績』をお客様と共有しましょう」"
      };
    } else {
      return {
        title: `${selectedFund?.name || 'ファンド'} 時系列パフォーマンス分析`,
        desc: "ファンドの買付期から現在に至るまでの時系列データを分析します。",
        columns: ["経過段階", "基準価額", "分配金累計", "トータル成果", "実質トータル利益"],
        rows: [
          { period: "お買付当時", nav: `¥${selectedFund?.purchasePrice?.toLocaleString() || 0}`, dist: "0円", total: `¥${selectedFund?.purchasePrice?.toLocaleString() || 0}`, yieldRate: "±0.0% (元本保護)" },
          { period: "現在", nav: `¥${selectedFund?.currentPrice?.toLocaleString() || 0}`, dist: `¥${selectedFund ? (selectedFund.totalDistribution / (selectedFund.units / 10000)).toLocaleString() : 0}円`, total: `¥${selectedFund ? (selectedFund.currentValue + selectedFund.totalDistribution).toLocaleString() : 0}円相当`, yieldRate: `+${selectedFund?.trRate || 0}% (+${selectedFund?.totalReturn?.toLocaleString() || 0}円)` }
        ],
        gaAdvice: "中核運用としての高インカム蓄積、または成長投資としての値上がり益など、お買付時の鈴木様・山田様の本来の期待方針に照らし合わせ、一貫したメッセージをお伝えしてください。"
      };
    }
  };

  const timelineData = getTimelineAnalysisData();

  // 商品分析シート用データ
  const getProductAnalysisData = () => {
    if (!selectedFund) return null;
    const fundId = selectedFund.id;
    
    if (fundId === "FUND-INDIA") {
      return {
        name: selectedFund.name,
        nickname: selectedFund.nickname,
        character: "高成長を維持するインドのソブリン債（国債・州政府債など）やインフラ関連企業社債等へ分散投資を行い、高い現地通貨（ルピー建）のクーポンインカムをダイレクトに追求する、中核運用に最適なインカム型海外債券ファンド。",
        strategy: "インド現地国債の金利（年率6〜7%台）をベース収益とし、徹底したボトムアップ分析とマクロ経済分析をハイブリッドさせ、高い信用格付けを持つ債券のみを組み入れます。為替ヘッジをしないことでヘッジコストを一切支払わず、インドの経済成長に伴う通貨ルピーの長期上昇益（キャピタル）の獲得を狙います。",
        sensitivity: {
          rateUp: "急激な利上げショック局面では、債券価格自体の下落により一時的な基準価額の押し下げ圧力が発生しますが、商品が持つ分厚い利息クーポン（分配原資）の自律的積み上げが強力な価格クッションとして機能します。",
          rateDown: "今後進行する世界の金利低下局面は、新興国への投資マネーの還流を促します。インドの既発高金利債券の市場価値が高まることで、基準価額が本体価格の上昇にともなって本格的な反転上昇期に入る追い風となります。",
          fx: "為替ヘッジなし仕様。対円でのルピー高はダイレクトにプラスに作用。ヘッジコストが一切発生しないため、長期保有においてパフォーマンスが年率3〜5%近く目減りするリスクを物理的に回避しています。"
        },
        portfolio: [
          { item: "インド国債・政府機関公社債", ratio: "55.4%", detail: "信用力が極めて高く、市場の流動性に優れたインカムポートフォリオの主役" },
          { item: "インド州政府債・インフラ社債等", ratio: "38.2%", detail: "流動性と安全性を兼ね備えつつ、ポートフォリオ全体の利回りを高めるスプレッド獲得アセット" },
          { item: "MRF・短期コール金融資産", ratio: "6.4%", detail: "ポートフォリオ調整および解約支払・追加買付に対応するための高流動性バッファ" }
        ],
        gaPoint: "「お買付のタイミングに関わらず、この商品の本質は『インド公社債が内包する圧倒的な金利・インカム創出力』にあります。基準価額の一時的な上下動に目を奪われがちな鈴木様に対し、中核をなすインド公社債がいかに安全に高い利子を稼ぎ出し続けているか、商品設計としての強みをご説明ください」"
      };
    } else if (fundId === "FUND-PICTET") {
      return {
        name: selectedFund.name,
        nickname: selectedFund.nickname,
        character: "日本を除く世界各国の、人々の生活に絶対に不可欠な公益企業（電力、ガス、水道、エネルギー、電気通信等）の好配当株式に厳選投資を行い、景気後退にびくともしない安定的・継続的なインカムを追求する, 長寿グローバル公益株式ファンド。",
        strategy: "一般的なテクノロジー・製造業株式のような激しい景気サイクル（需要変動）の影響を受けず、不況期でも安定した料金キャッシュフローを獲得できる公益企業（ディフェンシブセクター）のみを厳選。参入障壁が高く、インフレに伴う価格転嫁権（利用料金の引き上げ能力）を持つ優良企業の株式をボトムアップリサーチで組み入れます。",
        sensitivity: {
          rateUp: "急激な金利急騰局面では、高バリュエーション株式への割引圧力と、他利回りアセットとの相対的な優位性の低下から、株価自体の価格調整が強く働きやすい仕様となっています（債券ライクな特性）。",
          rateDown: "金利の引き下げ局面においては、インフラ公益株が提供する安定的な好配当利回りが市場から際立って選好され、基準価額自体の見直しを伴う本格的な回復上昇軌道へ移行する特性を持ちます。",
          fx: "為替ヘッジなし仕様。主としてドル、ユーロ、スイスフランなど各先進国の強い実質通貨で好配当株を保有。為替コスト（ヘッジコスト）を排除し、長期円安局面における評価額増大のポテンシャルをフルに享受します。"
        },
        portfolio: [
          { item: "世界大手電力・ガスインフラ企業株式", ratio: "58.2%", detail: "法的な規制や地域独占に守られ、不況期でも高いキャッシュ創出力を示す配当企業" },
          { item: "世界大手水道・水道処理・環境インフラ株", ratio: "28.5%", detail: "価格改定権が極めて強固で、人口増加や都市化に伴い長期で安定成長するディフェンシブ株式" },
          { item: "グローバル情報通信サービス・ネットワーク株", ratio: "13.3%", detail: "生活に完全に溶け込み、高いキャッシュフローを背景とした高配当増配ポテンシャル企業" }
        ],
        gaPoint: "「リーマンショックからコロナショックまで、過去20年の激動の中で『人々の生活インフラ（電気・ガス・水道）』が止まったことは一度もありません。基準価額がどれだけ変動しようとも、商品の中身をなす公益企業からは毎月安定した配当が現金として還流し続けています。商品としての圧倒的なディフェンシブ性を自信を持ってご説明ください」"
      };
    } else if (fundId === "FUND-REIT") {
      return {
        name: selectedFund.name,
        nickname: selectedFund.nickname,
        character: "日本を除く世界主要国の、オフィスビル、大型商業施設、物流倉庫、住宅など『実物不動産』に広く分散投資を行うREIT（不動産投資信託）専門のアクティブインカム型ファンド。",
        strategy: "実物不動産が持つ強固な裏付け価値（担保価値）と、物価上昇に追随する『家賃インカムのインフレ耐性』に着目。世界の主要不動産マーケットのキャップレート、入居率、賃料トレンドを徹底的に分析し、キャッシュフローが最も盤石な優良銘柄に特化運用します。",
        sensitivity: {
          rateUp: "利上げ初期には、不動産開発ローンの借入金利負担への懸念から、リート本体の取引価格が一時的に大きく軟化する傾向があります（逆風期）。",
          rateDown: "金利がピークアウトして低下する局面（現在の環境）では、支払利息コストの圧縮に加え、実物不動産の持つ家賃利回りの相対的価値が急上昇するため、リート基準価額自体の本格的な買い戻し反発サイクルに移行します。",
          fx: "為替ヘッジなし仕様。世界のプライム不動産の価値を、円安によるプレミアム価格として日本の預かり資産に取り込みます。実物家賃をヘッジコスト抜きで手元に還流保全するための最適設計です。"
        },
        portfolio: [
          { item: "世界主要都市のオフィス・大型商業リート", ratio: "41.5%", detail: "好立地なプレミアムビルを保有し、長期にわたり強固な法人テナントから家賃を安定回収するリート" },
          { item: "世界のハイテク物流施設・データセンターリート", ratio: "37.2%", detail: "eコマースの急成長とクラウド・AI社会の発展を不動産面から支える、賃料上昇率の極めて高い新成長REIT" },
          { item: "世界ヘルスケア・賃賃住宅リート", ratio: "21.3%", detail: "高齢化に伴う需要増や、人の移動・住居需要など、景気に一切左右されない超ディフェンシブ家賃リート" }
        ],
        gaPoint: "「投資信託が投資しているのは、紙ベースの架空アセットではなく、世界主要都市に実在する『オフィスビルや最新物流倉庫の大家さんとしての権利』です。お持ちの期間を問わず、一等地不動産から毎月生み出される『家賃キャッシュ』が、山田様の口座へ還流され続けている本質を丁寧にご説明ください」"
      };
    } else if (fundId === "FUND-B") {
      return {
        name: selectedFund.name,
        nickname: selectedFund.nickname,
        character: "いちよし証券が厳選した、世界の優良な好配当企業および持続的な増配余力を持つ『増配クオリティ企業』の株式に分散投資し、中長期的な資本の増大と成長インカムを狙うアクティブ株式ファンド。",
        strategy: "配当利回りが高いだけの衰退企業（配当の罠）を徹底的に排除。高いビジネスの競争優位性と、年々の売上利益成長を背景として『配当金を毎年増やし続ける能力（増配）』のあるグローバル企業を厳選保有します。",
        sensitivity: {
          rateUp: "配当や確固たる利益の裏付けがないグロース株と比較して金利上昇時の耐久性が非常に高く、安定したバリュー株としての強みを発揮します。",
          rateDown: "利下げ期には、企業の設備投資意欲の回復とバリュエーション割引率の緩和により、好配当を出し続けるクオリティ企業の株式価値（基準価額）の上昇（キャピタル）を狙えます。",
          fx: "為替ヘッジなし。主要な通貨（米ドル、ユーロ、ポンド等）に自動的に資産を分散所有。円安相場におけるプラス要因を無駄なく享受します。"
        },
        portfolio: [
          { item: "世界増配・クオリティ株式", ratio: "72.5%", detail: "成長性と確実な配当増加を兼ね備えた、グローバル優良リーダー企業のポート" },
          { item: "世界の高配当バリュー株式", ratio: "21.8%", detail: "高い配当金（キャッシュフロー）を継続的に輩出し、基準価額を底支えするディフェンシブ" },
          { item: "現金・その他ポジション等", ratio: "5.7%", detail: "市場の急な下落時に、割安となった名門企業を安値で買い増すための機動的キャッシュ" }
        ],
        gaPoint: "「本質は『世界中の一流増配企業が稼ぎ出した利益の、分け前を受け取り続ける』商品設計にあります。保有の期間に関わらず、これら企業の高い成長力と配当が、お客様を中長期的にしっかりと守る盾となることを、商品分析としてお伝えください」"
      };
    } else {
      return {
        name: selectedFund?.name || 'ファンド',
        nickname: selectedFund?.nickname || 'ファンド',
        character: "いちよしの最も強みとする『徹底した現場ボトムアップ徹底調査』に基づき、独自の技術力やニッチなビジネスモデルで急成長が期待できる、国内の『未来の中核グロー企業』に特化した積極運用アクティブファンド。",
        strategy: "金融商品取引所に上場する全中小型株の中から、アナリストが企業を直接取材・経営陣と面談。表面的な財務諸表だけでは見抜けない、真の『競争優位性』『価格決定力』『高収益モデル』を持つイノベーション企業を厳選して集中投資します。",
        sensitivity: {
          rateUp: "金利上昇期には、将来の期待成長率に対する割引圧力が大きく働き、グロース・中小型株全体のバリュエーション見直しから短期で厳しい調整を受けやすくなります。",
          rateDown: "金利の引き下げ・安定期、および日本独自のインフレに伴う経済構造の転換期には、独自の高い価格転嫁力を武器に市場シェアを拡大する中小型株が最も高い急反発ポテンシャルを発揮します。",
          fx: "国内株運用のため直接の為替リスクはありません。ただし、極端な円高・円安による株式市場全体の投資マインドや海外勢の売買動向のセンチメント変化に追随します。"
        },
        portfolio: [
          { item: "国内イノベーション・DXサービス株式", ratio: "42.1%", detail: "人手不足や社会課題を独自のサービスで解決し、価格決定権を持つ高収益・高成長企業群" },
          { item: "国内先端技術・グローバルニッチ部材株", ratio: "35.6%", detail: "世界のサプライチェーンにおいて代替不可能であり、特定のニッチ技術で世界シェアを独占する製造業" },
          { item: "国内ユニークビジネスモデル株", ratio: "22.3%", detail: "他社が追随できない独自の流通網や、新しい販売構造を国内で開拓した高付加価値企業" }
        ],
        gaPoint: "「本商品の本質は、日本の未来を切り開く『卓越したニッチ成長企業を、いちよしの調査力を信じて早期に発掘する』という夢のアクティブ運用にあります。短期的・局所的な価格調整があれど、中身をなす企業の成長力そのものがいつの時代も中長期のリターンを決定づけるという、商品の根幹ストーリーを佐藤様らしくご提示ください」"
      };
    }
  };

  const productAnalysisData = getProductAnalysisData();
  
  // ==========================================
  // 3. レンダリングロジック
  // ==========================================

  // 未ログイン状態なら、エレガントなログイン画面を表示
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 font-sans relative overflow-hidden">
        {/* 背景の装飾用グラデーション球体 */}
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none"></div>

        {/* ヘッダー */}
        <header className="px-8 py-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-400 p-1 rounded"><span className="text-slate-950 font-extrabold text-xs block px-1.5 py-0.5 uppercase">NTT Data</span></div>
            <div className="h-6 w-[1px] bg-slate-700"></div>
            <div>
              <span className="text-amber-400 text-[10px] font-bold block tracking-widest uppercase">ABIC Financial Product Monitor</span>
              <h1 className="text-sm font-semibold text-slate-300">GA支援AIアシスタント</h1>
            </div>
          </div>
        </header>

        {/* ログインフォームメイン */}
        <main className="flex-1 flex items-center justify-center p-4 z-10">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3.5 bg-indigo-950/80 border border-indigo-500/30 rounded-2xl text-amber-400 mb-1">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">システム認証</h2>
              <p className="text-xs text-slate-400">グロー・アドバイザー支援システムにログインしてください</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {loginError && (
                <div className="bg-rose-950/50 border border-rose-500/40 text-rose-300 p-3.5 rounded-xl text-xs font-bold flex items-center space-x-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-extrabold tracking-wider block uppercase">ユーザーID</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input 
                    type="text" 
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    required
                    placeholder="ユーザー名を入力"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-xs outline-none text-white focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-extrabold tracking-wider block uppercase">パスワード</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input 
                    type="password" 
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-xs outline-none text-white focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* API KEY入力項目 (追加要求②) */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-amber-400 font-extrabold tracking-wider block uppercase">Gemini API KEY (オプション)</label>
                  <span className="text-[9px] text-slate-500 font-medium">※未入力時はローカル回答が動作</span>
                </div>
                <div className="relative">
                  <Sliders className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-amber-500/50" />
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIと連携する場合はキーを入力してください"
                    className="w-full bg-slate-950 border border-slate-800/80 focus:border-amber-400/50 rounded-xl py-3 pl-11 pr-4 text-xs outline-none text-white focus:ring-1 focus:ring-amber-400 transition-all font-medium"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg active:scale-[0.99] tracking-widest mt-6"
              >
                ログイン
              </button>
            </form>
          </div>
        </main>

        <footer className="py-6 border-t border-slate-900 text-center text-[9px] text-slate-600 font-bold tracking-widest z-10">
          © 2026 NTT DATA ABIC Co., Ltd. | SECURED GATEWAY
        </footer>
      </div>
    );
  }

  // ログイン成功後の本来のメインダッシュボード画面
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans">
      <header className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-md px-6 py-4 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center space-x-3">
          {view === 'dashboard' && (
            <button onClick={() => setView('list')} className="p-2 hover:bg-white/10 rounded-full transition-colors mr-2">
              <ChevronLeft className="w-6 h-6 text-amber-400" />
            </button>
          )}
          <div className="bg-white p-1 rounded"><span className="text-blue-900 font-extrabold text-xs block px-1 uppercase">NTT Data</span></div>
          <div className="h-6 w-[1px] bg-slate-400"></div>
          <div><span className="text-amber-400 text-xs font-semibold block tracking-wider">金融商品部 提案デモ</span><h1 className="text-lg font-bold">GA支援AIツール</h1></div>
        </div>

        {/* ユーザー情報＆ログアウト、専用レポートボタン */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-300 font-bold bg-slate-950/40 px-3.5 py-1.5 rounded-xl border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            <span>ユーザー: abic 様</span>
            {apiKey && <span className="text-amber-400 text-[10px] ml-1.5 font-extrabold bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/30">API稼働中</span>}
          </div>
          
          {currentCustomer && (
            <button onClick={() => setShowReportPreview(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-[10px] flex items-center shadow transition-all"><Printer className="w-4 h-4 mr-1.5" />顧客専用レポート</button>
          )}

          <button onClick={handleLogout} className="bg-slate-800 hover:bg-slate-700 text-white font-bold p-2 rounded-lg text-[10px] flex items-center justify-center transition-colors shadow" title="ログアウト">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {view === 'list' ? (
        <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center mb-8"><Users className="w-6 h-6 mr-2 text-indigo-600" />担当顧客リスト</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customersData.map(customer => (
              <button key={customer.id} onClick={() => handleSelectCustomer(customer)} className="bg-white border-2 border-transparent hover:border-indigo-500 rounded-3xl p-8 shadow-sm text-left transition-all group relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-0 group-hover:bg-indigo-50"></div>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full mb-1 inline-block">{customer.id}</span>
                      <h3 className="text-2xl font-bold text-slate-900">{customer.name} 様</h3>
                      <p className="text-xs text-slate-500 font-bold">{customer.age}歳 | {customer.segment}</p>
                    </div>
                    <div className="bg-slate-100 p-2.5 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors"><ChevronRight className="w-6 h-6" /></div>
                  </div>
                  <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-auto group-hover:bg-white transition-all">
                    <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div><span className="text-[10px] text-slate-400 font-bold block">対話 of インサイト:</span><p className="text-xs text-slate-700 font-medium leading-relaxed">{customer.insightSummary}</p></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </main>
      ) : (
        <>
          <div className="bg-white border-b px-6 py-3 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-100 p-2 rounded-full"><User className="w-5 h-5 text-slate-600" /></div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold">{currentCustomer?.name} 様</span>
                  <span className="text-xs bg-red-50 text-red-700 font-bold py-0.5 px-2 rounded border border-red-100">{currentCustomer?.segment}</span>
                </div>
                <span className="text-[10px] text-slate-500 block font-medium">顧客の方針: {currentCustomer?.policy}</span>
              </div>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl border">
              <button onClick={() => setActiveTab('layer1')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'layer1' ? 'bg-blue-900 text-white shadow' : 'text-slate-600'}`}>口座全体</button>
              <button onClick={() => setActiveTab('layer2')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'layer2' ? 'bg-blue-900 text-white shadow' : 'text-slate-600'}`}>保有運用状況</button>
              <button onClick={() => setActiveTab('layer3')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'layer3' ? 'bg-blue-900 text-white shadow' : 'text-slate-600'}`}>個別ファンド詳細</button>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden text-slate-800">
            <div ref={contentScrollRef} className="flex-1 lg:w-2/3 p-6 overflow-y-auto space-y-6">
              
              {/* TAB 1: 口座全体 */}
              {activeTab === 'layer1' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <h3 className="text-base font-bold text-blue-900 flex items-center">口座全体の現状サマリー</h3>
                    <span className="text-[10px] text-slate-500 font-extrabold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg self-start sm:self-auto tracking-wider">基準日：2026年5月末現在</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border shadow-sm"><span className="text-xs text-slate-500 font-bold block">お預かり資産合計</span><span className="text-2xl font-bold">¥{currentCustomer?.assets?.total?.toLocaleString()}</span></div>
                    <div className="bg-white p-4 rounded-xl border shadow-sm"><span className="text-xs text-slate-500 font-bold block">口座累計損益</span><span className="text-2xl font-bold text-emerald-600">+¥{currentCustomer?.assets?.gainLoss?.toLocaleString()}</span></div>
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 shadow-sm relative">
                      <div className="absolute right-2 bottom-2 opacity-10"><Award className="w-12 h-12 text-indigo-950" /></div>
                      <span className="text-xs text-indigo-900 font-bold block flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1" />AI 気づきアドバイス</span>
                      <p className="text-[10px] text-indigo-950 leading-tight mt-1 font-semibold">{currentCustomer?.insightSummary}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-500 block mb-4 self-start">資産ポートフォリオ構成比</span>
                      <div className="w-48 h-48 relative">
                        <svg viewBox="0 0 40 40" className="w-full h-full transform -rotate-90">
                          {(() => {
                            const radius = 15.9154943;
                            const circumference = 2 * Math.PI * radius; // 100.00
                            let accumulatedPercent = 0;
                            
                            return currentCustomer?.assets?.categories?.map((cat, i) => {
                              const percent = (cat.value / currentCustomer.assets.total) * 100;
                              const strokeLength = (percent / 100) * circumference;
                              const strokeOffset = -(accumulatedPercent / 100) * circumference;
                              accumulatedPercent += percent;
                              
                              return (
                                <circle 
                                  key={i} 
                                  cx="20" 
                                  cy="20" 
                                  r={radius} 
                                  fill="none" 
                                  stroke={cat.color} 
                                  strokeWidth="4" 
                                  strokeDasharray={`${strokeLength} ${circumference}`} 
                                  strokeDashoffset={strokeOffset} 
                                  strokeLinecap="butt"
                                />
                              );
                            });
                          })()}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-[10px] text-slate-400">Total Asset</div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full text-[10px]">
                        {currentCustomer?.assets?.categories?.map((cat,i)=>(<div key={i} className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full" style={{backgroundColor:cat.color}}></span><span className="text-slate-500">{cat.name} ({Math.round((cat.value / currentCustomer.assets.total) * 100)}%)</span></div>))}
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                      <span className="text-xs font-bold text-slate-500 block mb-4">資産別残高・損益内訳</span>
                      <div className="space-y-2 text-[11px]">
                        {currentCustomer?.assets?.categories?.map((cat, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg font-medium border border-slate-100">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                              <span className="font-bold text-slate-700">{cat.name}</span>
                            </div>
                            <div className="text-right flex items-center space-x-4">
                              <div>
                                <span className="text-[9px] text-slate-400 block font-normal text-right">評価額</span>
                                <span className="font-bold text-slate-900">¥{cat.value.toLocaleString()}</span>
                              </div>
                              <div className="w-24">
                                <span className="text-[9px] text-slate-400 block font-normal text-right">評価損益</span>
                                <span className={`font-bold block text-right ${cat.gain > 0 ? 'text-emerald-600' : cat.gain < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                                  {cat.gain > 0 ? `+¥${cat.gain.toLocaleString()}` : cat.gain < 0 ? `-¥${Math.abs(cat.gain).toLocaleString()}` : '±¥0'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: 保有運用状況 */}
              {activeTab === 'layer2' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <h3 className="text-base font-bold text-blue-900">保有運用状況 ＆ 市場環境ギャップ</h3>
                    <span className="text-[10px] text-slate-500 font-extrabold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg self-start sm:self-auto tracking-wider">基準日：2026年5月末現在</span>
                  </div>
                  <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 text-slate-400 font-bold border-b tracking-wider">
                        <tr><th className="p-4">ファンド名</th><th className="p-4 text-right">評価金額</th><th className="p-4 text-right">累計分配金</th><th className="p-4 text-right">トータルリターン</th></tr>
                      </thead>
                      <tbody className="divide-y">
                        {currentCustomer?.funds?.map(fund => (
                          <tr key={fund.id} onClick={() => setSelectedFundId(fund.id)} className={`cursor-pointer transition-colors ${selectedFundId === fund.id ? 'bg-indigo-50/70' : 'hover:bg-slate-50'}`}>
                            <td className="p-4 font-bold text-slate-900">{fund.name}<span className="block text-[9px] text-slate-400 font-medium">愛称：{fund.nickname}</span></td>
                            <td className="p-4 text-right">¥{fund.currentValue.toLocaleString()}</td>
                            <td className="p-4 text-right text-indigo-600 font-bold">¥{fund.totalDistribution.toLocaleString()}</td>
                            <td className={`p-4 text-right font-extrabold ${fund.totalReturn > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>+¥{fund.totalReturn.toLocaleString()}<span className="block text-[9px]">{fund.trRate}%</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border shadow-sm space-y-5">
                    <h4 className="text-sm font-extrabold text-slate-900 border-b pb-2 flex items-center"><Target className="w-4 h-4 mr-2 text-indigo-600" />{selectedFund?.name || 'ファンド'} の背景分析</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs leading-relaxed">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs">
                        <div className="flex items-center space-x-1.5 text-slate-800 font-extrabold mb-2 uppercase tracking-tighter">
                          <Globe className="w-3.5 h-3.5 text-blue-900" />
                          <span>【当時】購入当時の投資環境</span>
                        </div>
                        <p className="text-slate-600 font-medium leading-relaxed">{selectedFund?.purchaseEnv || '未設定'}</p>
                      </div>
                      
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-xs">
                        <div className="flex items-center space-x-1.5 text-amber-800 font-extrabold mb-2 uppercase tracking-tighter">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>【当時】お買付の目的と期待値</span>
                        </div>
                        <p className="italic text-slate-700 font-medium leading-relaxed">"{selectedFund?.customerExpectation || '未設定'}"</p>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-xs">
                        <div className="flex items-center space-x-1.5 text-blue-900 font-extrabold mb-2 uppercase tracking-tighter">
                          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                          <span>【現在】その後の環境変化と要因分解</span>
                        </div>
                        <p className="text-slate-700 font-medium leading-relaxed">{selectedFund?.envDifference || '未設定'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 bg-white border border-slate-300 py-3.5 rounded-xl text-xs font-bold flex justify-center items-center hover:bg-slate-50 transition shadow-sm gap-2">
                      <Activity className="w-4 h-4 text-indigo-700 shrink-0" />
                      保有ファンドの相関分析ツール
                    </button>
                    <button onClick={() => setShowReturnAnalysisModal(true)} className="flex-1 bg-white border border-slate-300 py-3.5 rounded-xl text-xs font-bold flex justify-center items-center hover:bg-slate-50 transition shadow-sm gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-600 shrink-0" />
                      累積リターンの時系列推移
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: 個別ファンド詳細 */}
              {activeTab === 'layer3' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <h3 className="text-base font-bold text-blue-900">個別ファンド詳細：{selectedFund?.nickname || 'ファンド'}</h3>
                    <span className="text-[10px] text-slate-500 font-extrabold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg self-start sm:self-auto tracking-wider">基準日：2026年5月末現在</span>
                  </div>
                  <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div className="bg-slate-50 p-3 rounded-xl border"><span className="text-[10px] text-slate-400 block font-bold">基準価額</span><span className="text-lg font-bold">¥{selectedFund?.currentPrice?.toLocaleString() || 0}</span></div>
                      <div className="bg-slate-50 p-3 rounded-xl border"><span className="text-[10px] text-slate-400 block font-bold uppercase">純資産</span><span className="text-lg font-bold">{selectedFund?.netAssets || '未設定'}</span></div>
                      <div className="bg-slate-50 p-3 rounded-xl border">
                        <span className="text-[10px] text-slate-400 block font-bold">トータルリターン(累積)</span>
                        <span className={`text-sm font-bold block ${selectedFund && selectedFund.totalReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {selectedFund && selectedFund.totalReturn >= 0 ? '+' : ''}{selectedFund?.totalReturn?.toLocaleString()}円 ({selectedFund?.trRate}%)
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-700 block mb-3 flex items-center">
                        <Activity className="w-4 h-4 mr-1.5 text-indigo-600" />
                        期間別リターン実績（年率換算）
                      </span>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs">
                          <span className="text-[9px] text-slate-400 block font-bold uppercase">1年</span>
                          <span className={`text-xs font-extrabold block mt-0.5 ${selectedFund?.returns?.y1 !== null && selectedFund!.returns.y1 >= 0 ? 'text-emerald-600' : selectedFund?.returns?.y1 !== null && selectedFund!.returns.y1 < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                            {selectedFund?.returns?.y1 !== null ? `${selectedFund!.returns.y1 > 0 ? '+' : ''}${selectedFund!.returns.y1}%` : '-'}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs">
                          <span className="text-[9px] text-slate-400 block font-bold uppercase">3年</span>
                          <span className={`text-xs font-extrabold block mt-0.5 ${selectedFund?.returns?.y3 !== null && selectedFund!.returns.y3 >= 0 ? 'text-emerald-600' : selectedFund?.returns?.y3 !== null && selectedFund!.returns.y3 < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                            {selectedFund?.returns?.y3 !== null ? `${selectedFund!.returns.y3 > 0 ? '+' : ''}${selectedFund!.returns.y3}%` : '-'}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs">
                          <span className="text-[9px] text-slate-400 block font-bold uppercase">5年</span>
                          <span className={`text-xs font-extrabold block mt-0.5 ${selectedFund?.returns?.y5 !== null && selectedFund!.returns.y5 >= 0 ? 'text-emerald-600' : selectedFund?.returns?.y5 !== null && selectedFund!.returns.y5 < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                            {selectedFund?.returns?.y5 !== null ? `${selectedFund!.returns.y5 > 0 ? '+' : ''}${selectedFund!.returns.y5}%` : '-'}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs">
                          <span className="text-[9px] text-slate-400 block font-bold uppercase">10年</span>
                          <span className={`text-xs font-extrabold block mt-0.5 ${selectedFund?.returns?.y10 !== null && selectedFund!.returns.y10 >= 0 ? 'text-emerald-600' : selectedFund?.returns?.y10 !== null && selectedFund!.returns.y10 < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                            {selectedFund?.returns?.y10 !== null ? `${selectedFund!.returns.y10 > 0 ? '+' : ''}${selectedFund!.returns.y10}%` : '-'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[8px] text-slate-400 font-bold mt-2 text-right">※「-」表記はファンドの運用期間が指定年数に満たないことを示します。</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs leading-relaxed">
                      <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
                        <span className="text-blue-900 font-extrabold mb-2.5 flex items-center uppercase tracking-wider">
                          <Briefcase className="w-4 h-4 mr-1.5 text-indigo-600 shrink-0" />
                          主要投資対象
                        </span>
                        <p className="text-slate-700 font-bold leading-relaxed">{selectedFund?.investmentTarget || 'データベース未設定'}</p>
                      </div>
                      
                      <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
                        <span className="text-blue-900 font-extrabold mb-2.5 flex items-center uppercase tracking-wider">
                          <TrendingUp className="w-4 h-4 mr-1.5 text-indigo-600 shrink-0" />
                          運用方針
                        </span>
                        <p className="text-slate-700 font-bold leading-relaxed">{selectedFund?.investmentPolicy || 'データベース未設定'}</p>
                      </div>
                      
                      <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
                        <span className="text-blue-900 font-extrabold mb-2.5 flex items-center uppercase tracking-wider">
                          <Clock className="w-4 h-4 mr-1.5 text-indigo-600 shrink-0" />
                          決算（分配方針）
                        </span>
                        <p className="text-slate-700 font-bold leading-relaxed">{selectedFund?.distributionPolicy || 'データベース未設定'}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 border-b border-slate-100 pb-3">
                        <span className="text-xs font-bold text-slate-700 flex items-center">
                          <Activity className="w-4 h-4 mr-1.5 text-indigo-600 animate-pulse" />
                          基準価額推移とトータル成果リターンの推移相関（月足）
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[9px] font-extrabold text-slate-500 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto leading-none">
                          <div className="flex items-center space-x-1.5">
                            <span className="w-3.5 h-0.75 bg-indigo-600 rounded-full inline-block"></span>
                            <span>トータル成果（累積）</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="w-3.5 h-0.5 border-t-2 border-dashed border-slate-400 inline-block"></span>
                            <span>基準価額</span> 
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 bg-amber-500/40 rounded-xs inline-block"></span>
                            <span>分配金額</span> 
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-48 bg-white rounded border border-slate-100 p-2 relative flex flex-col justify-end">
                        <div className="absolute left-1 top-2 bottom-8 w-11 flex flex-col justify-between text-[8px] font-bold text-slate-400 text-right pr-1 border-r border-slate-100 z-10 leading-none">
                          <div className="pt-1">¥{Math.round(chartInfo.maxVal).toLocaleString()}</div>
                          <div>¥{Math.round((chartInfo.maxVal + chartInfo.minVal) / 2).toLocaleString()}</div>
                          <div className="pb-1">¥{Math.round(chartInfo.minVal).toLocaleString()}</div>
                        </div>

                        <div className="absolute right-1 top-2 bottom-8 w-11 flex flex-col justify-between text-[8px] font-bold text-slate-400 text-left pl-1 border-l border-slate-100 z-10 leading-none">
                          <div className="pt-1">100円</div>
                          <div>50円</div>
                          <div className="pb-1">0円</div>
                        </div>

                        <svg className="w-full h-40 pl-11 pr-11" viewBox="0 0 700 150">
                          <line x1="10" y1="10" x2="690" y2="10" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="10" y1="70" x2="690" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                          <line x1="10" y1="130" x2="690" y2="130" stroke="#e2e8f0" strokeWidth="1" />
                          
                          {chartInfo.trPath && <path d={chartInfo.trPath} fill="none" stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" />}
                          {chartInfo.navPath && <path d={chartInfo.navPath} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />}
                          
                          {chartInfo.points.map((p, i) => (
                            <rect key={i} x={p.x - 3} y={130 - (p.interestRate * 12)} width="6" height={p.interestRate * 12} fill="#f59e0b" fillOpacity="0.4" rx="1" />
                          ))}
                          {chartInfo.points.map((p, i) => (
                            <text key={i} x={p.x} y="145" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">{p.month}</text>
                          ))}
                        </svg>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                      <button onClick={() => setShowProductAnalysisModal(true)} className="bg-white border border-slate-300 py-2.5 px-2 rounded-xl text-[10px] font-bold flex flex-col sm:flex-row justify-center items-center hover:bg-slate-50 transition shadow-sm gap-1.5"><BookOpen className="w-4 h-4 text-indigo-700 shrink-0" />商品分析シート</button>
                      <button className="bg-white border border-slate-300 py-2.5 px-2 rounded-xl text-[10px] font-bold flex flex-col sm:flex-row justify-center items-center hover:bg-slate-50 transition shadow-sm gap-1.5"><FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />月次運用報告書(PDF)</button>
                      <button className="bg-white border border-slate-300 py-2.5 px-2 rounded-xl text-[10px] font-bold flex flex-col sm:flex-row justify-center items-center hover:bg-slate-50 transition shadow-sm gap-1.5"><Activity className="w-4 h-4 text-teal-600 shrink-0" />リターン(時系列分析)</button>
                      <button className="bg-white border border-slate-300 py-2.5 px-2 rounded-xl text-[10px] font-bold flex flex-col sm:flex-row justify-center items-center hover:bg-slate-50 transition shadow-sm gap-1.5"><TrendingUp className="w-4 h-4 text-sky-600 shrink-0" />ベンチマーク比較</button>
                      <button className="bg-white border border-slate-300 py-2.5 px-2 rounded-xl text-[10px] font-bold flex flex-col sm:flex-row justify-center items-center hover:bg-slate-50 transition shadow-sm gap-1.5"><Sliders className="w-4 h-4 text-amber-500 shrink-0" />金利為替シナリオ分析</button>
                      <button className="bg-white border border-slate-300 py-2.5 px-2 rounded-xl text-[10px] font-bold flex flex-col sm:flex-row justify-center items-center hover:bg-slate-50 transition shadow-sm gap-1.5"><FileText className="w-4 h-4 text-rose-500 shrink-0" />顧客提示用リーフレット</button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: AIチャット */}
            <div className="lg:w-1/3 bg-white border-l border-slate-200 flex flex-col shrink-0">
              <div className="p-4 bg-gradient-to-r from-blue-950 to-indigo-900 text-white flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block">
                    {activeTab === 'layer1' ? '口座全体' : activeTab === 'layer2' ? '保有運用' : 'ファンド詳細'}分析チャット
                  </span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 border-b border-slate-200 overflow-y-auto max-h-48 shrink-0">
                <span className="text-[9px] font-bold text-slate-400 block mb-2 flex items-center uppercase tracking-tighter"><Sliders className="w-3.5 h-3.5 mr-1 text-indigo-600" />インサイト獲得プリセット</span>
                <div className="flex flex-col gap-1.5">
                  {getPresetQuestions().map((preset, idx) => (
                    <button key={idx} onClick={() => handlePresetClick(preset.q)} className="bg-white border border-slate-200 text-[10px] text-blue-900 hover:bg-indigo-50 hover:border-indigo-300 py-1.5 px-2.5 rounded-lg font-bold text-left transition shadow-xs w-full leading-snug">
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                {(chatMessages[activeTab] || []).map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="text-[9px] text-slate-400 font-semibold">{msg.sender === 'user' ? '佐藤GA (あなた)' : 'ABIC営業支援AI'}</span>
                      <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                    </div>
                    <div className={`p-3.5 rounded-2xl max-w-[90%] text-[11px] leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-blue-900 text-white rounded-tr-none' : 'bg-white border border-slate-200 rounded-tl-none text-slate-800'}`}>
                      {msg.text.split('\n').map((line,idx)=>(<span key={idx}>{line}<br/></span>))}
                    </div>
                  </div>
                ))}
                {isTyping && <div className="text-[9px] text-slate-400 font-bold italic animate-pulse">AIが市場変遷と口座要因を分析中...</div>}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 bg-white border-t flex space-x-2 shrink-0">
                <input type="text" value={inputText} onChange={(e)=>setInputText(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&handleSendMessage()} placeholder="口座構成における気づきの観点は？など..." className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-blue-900 outline-none bg-slate-50 focus:bg-white transition-all text-slate-800" />
                <button onClick={()=>handleSendMessage()} className="bg-blue-900 hover:bg-blue-800 text-white p-2.5 rounded-xl shadow-lg transition-all"><Send className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 累積インカムリターン時系列分析ポップアップ(モーダル) */}
      {showReturnAnalysisModal && timelineData && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[100] p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-blue-950 to-indigo-900 text-white p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-teal-400" />
                <h4 className="font-extrabold text-sm sm:text-base tracking-wide">{timelineData.title}</h4>
              </div>
              <button onClick={() => setShowReturnAnalysisModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition text-xs font-bold px-3">閉じる</button>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800">
              <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-slate-50 p-4 rounded-2xl border border-slate-100">{timelineData.desc}</p>
              
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-500 tracking-wider">
                    <tr>
                      {timelineData.columns.map((col, i) => (
                        <th key={i} className="p-4.5">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {timelineData.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/70 font-semibold transition-colors">
                        <td className="p-4.5 text-slate-900 font-bold">{row.period}</td>
                        <td className="p-4.5 text-slate-500">{row.nav}</td>
                        <td className="p-4.5 text-indigo-600 font-extrabold">{row.dist}</td>
                        <td className="p-4.5 text-slate-800">{row.total}</td>
                        <td className="p-4.5 text-emerald-600 font-extrabold">{row.yieldRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <span className="text-xs font-extrabold text-slate-900 block uppercase tracking-wide">GAからお客様へのアプローチ提案視点(気づきの種):</span>
                  <p className="text-[11px] text-slate-700 leading-relaxed italic">
                    {timelineData.gaAdvice}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 商品特性「商品分析シート」ポップアップ（モーダル） */}
      {showProductAnalysisModal && productAnalysisData && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[100] p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-blue-950 to-indigo-900 text-white p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h4 className="font-extrabold text-sm sm:text-base tracking-wide">
                  【商品特性分析シート】{productAnalysisData.name} ({productAnalysisData.nickname})
                </h4>
              </div>
              <button onClick={() => setShowProductAnalysisModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition text-xs font-bold px-3">閉じる</button>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">1. 商品キャラクター ＆ 運用コンセプト</span>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {productAnalysisData.character}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">2. 収益獲得プロセス ＆ ポジショニング</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200 font-semibold">
                  {productAnalysisData.strategy}
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">3. マクロ変動（金利・為替仕様）に対する挙動・仕組み</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] leading-relaxed">
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 font-medium">
                    <span className="text-amber-800 font-extrabold block mb-1">【金利上昇局面での仕様特性】</span>
                    <p className="text-slate-600">{productAnalysisData.sensitivity.rateUp}</p>
                  </div>
                  <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 font-medium">
                    <span className="text-teal-800 font-extrabold block mb-1">【金利低下局面での仕様特性】</span>
                    <p className="text-slate-600">{productAnalysisData.sensitivity.rateDown}</p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 font-medium">
                    <span className="text-blue-800 font-extrabold block mb-1">【為替ヘッジなし影響・コスト】</span>
                    <p className="text-slate-600">{productAnalysisData.sensitivity.fx}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">4. 基本の資産組成・主要セクター比率</span>
                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-500 tracking-wider">
                      <tr>
                        <th className="p-4">アセットクラス / 主要セクター</th>
                        <th className="p-4 text-center">基本比率</th>
                        <th className="p-4">投資信託内における本質的な役割</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productAnalysisData.portfolio.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/70 font-semibold transition-colors">
                          <td className="p-4 text-slate-900 font-bold">{row.item}</td>
                          <td className="p-4 text-center text-indigo-600 font-extrabold">{row.ratio}</td>
                          <td className="p-4 text-slate-600">{row.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-5 rounded-3xl text-white flex items-start space-x-3.5 shadow-md">
                <Lightbulb className="w-6 h-6 text-amber-300 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-300 block uppercase tracking-wide">佐藤GAから顧客への語りかけ（ファンド固有の特性アプローチ）:</span>
                  <p className="text-[11px] text-slate-100 leading-relaxed font-semibold italic">
                    {productAnalysisData.gaPoint}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {showReportPreview && currentCustomer && (
        <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[100] p-4 overflow-hidden animate-fade-in">
          <div className={`bg-white w-full h-full flex flex-col transition-all overflow-hidden shadow-2xl ${isReportFullScreen ? '' : 'max-w-4xl max-h-[90vh] rounded-3xl'}`}>
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3"><FileText className="w-5 h-5 text-amber-400" /><span className="text-sm font-bold tracking-wide">{currentCustomer.name}様 限りトータル運用レポート</span></div>
              <div className="flex gap-2">
                <button onClick={()=>setIsReportFullScreen(!isReportFullScreen)} className="p-2 hover:bg-white/10 rounded-lg">{isReportFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}</button>
                <button onClick={()=>setShowReportPreview(false)} className="bg-white/10 p-2 hover:bg-white/20 rounded-lg">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-slate-100 flex justify-center text-slate-800">
              <div className="bg-white w-full max-w-2xl p-16 shadow-2xl space-y-10 border rounded-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-900"></div>
                <div className="pb-6 flex justify-between items-end border-b-2 border-slate-100">
                  <div><h2 className="text-2xl font-bold text-slate-900">{currentCustomer.name} 様 お預かり運用レポート</h2><span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-[0.2em] block mt-1">Ichiyoshi Securities Financial Products Dept.</span></div>
                  <div className="text-[10px] text-red-600 font-extrabold border-2 border-red-100 px-3 py-1.5 bg-red-50 tracking-tighter">社外配布厳禁 / 社内管理資料</div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-xs font-extrabold border-l-4 border-blue-900 pl-3 text-blue-900 uppercase tracking-widest">1. 口座全体の運用概況</h4>
                  <div className="bg-slate-50 p-8 rounded-3xl flex justify-between items-center border border-slate-100">
                    <div className="text-center"><span className="text-[10px] block font-bold text-slate-400 mb-1">総預り残高</span><span className="text-2xl font-bold text-slate-900">¥{currentCustomer?.assets?.total?.toLocaleString()}</span></div>
                    <div className="h-10 w-[2px] bg-slate-200"></div>
                    <div className="text-center"><span className="text-[10px] block font-bold text-slate-400 mb-1">累計トータル成果額</span><span className="text-2xl font-bold text-emerald-600">+¥{currentCustomer?.assets?.gainLoss?.toLocaleString()}</span></div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-xs font-extrabold border-l-4 border-blue-900 pl-3 text-blue-900 uppercase tracking-widest">2. 各ファンドのトータルリターン実績詳細</h4>
                  <div className="space-y-4">
                    {currentCustomer?.funds?.map(f => (
                      <div key={f.id} className="border-b border-slate-100 pb-4 last:border-0">
                        <div className="flex justify-between font-bold text-sm mb-2"><span className="text-slate-800">{f.name}</span><span className="text-indigo-600 font-extrabold">累計分配金: ¥{f.totalDistribution.toLocaleString()}</span></div>
                        <div className="grid grid-cols-2 text-[10px] text-slate-500 font-medium"><div>当初お買付額: <span className="text-slate-900 font-bold">¥{f.cost.toLocaleString()}</span></div><div className="text-right">トータル成果額: <span className={`font-extrabold ${f.totalReturn>0?'text-emerald-600':'text-rose-600'}`}>+¥{f.totalReturn.toLocaleString()} ({f.trRate}%)</span></div></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-12 text-center text-slate-400 border-t border-slate-100"><p className="text-[9px] font-bold tracking-widest leading-loose uppercase opacity-60">Generated by NTT Data ABIC / Financial Analysis Engine Fund Monitor®</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-slate-950 text-slate-500 text-center py-4 text-[9px] shrink-0 border-t border-slate-900 font-bold tracking-widest uppercase">
        © 2026 NTT DATA ABIC Co., Ltd. | Empowering Advisors through AI-Driven Insights
      </footer>
    </div>
  );
}