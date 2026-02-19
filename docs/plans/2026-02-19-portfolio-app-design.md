# 2026-02-19 Android Portfolio App Design

## Overview
개인 투자자를 위한 실시간 주식, ETF, 암호화폐 통합 포트폴리오 관리 앱입니다. 사용자의 금융 데이터를 보호하기 위해 **Local-First** 접근 방식을 채택하며, 자동 연동과 수동 입력을 모두 지원합니다.

## User Journeys (CUJ)
1. **[CUJ 1] 통합 자산 등록 및 연동**: 거래소 API 연동 및 수동 입력을 통한 모든 자산 통합.
2. **[CUJ 2] 포트폴리오 종합 대시보드**: 실시간 시세 반영 총액 및 자산군별 비중(Donut Chart) 확인.
3. **[CUJ 3] 개별 종목 관리**: 개별 종목의 상세 상태 확인 및 수동 자산의 최신 상태 유지.

## Architecture & Tech Stack
- **Architecture**: Android Clean Architecture + MVVM
- **UI Framework**: Jetpack Compose
- **Local DB**: Room (Asset & Ticker storage)
- **Security**: EncryptedSharedPreferences, Android Keystore (API Keys)
- **Networking**: Retrofit / Ktor
- **Concurrency**: Kotlin Coroutines & Flow
- **Background Work**: WorkManager (Periodic price sync)

## Data Flow
1. **Sync**: WorkManager가 주기적으로 각 거래소 API 및 시세 API를 호출하여 최신 가격(Ticker)을 로컬 DB에 업데이트합니다.
2. **Read**: ViewModel이 Room DB의 `Asset`과 `Ticker` 테이블을 `Flow`로 관찰하여 실시간으로 UI(Dashboard)를 갱신합니다.
3. **Write**: 사용자가 직접 자산을 추가하거나 API 키를 등록하면 즉시 암호화되어 로컬에 저장됩니다.

## Testing Strategy
- **Unit Test**: UseCase 로직 및 데이터 매핑 검증.
- **Room Test**: DAO 연산 및 데이터 무결성 검증.
- **Integration Test**: Mock API를 활용한 시세 연동 흐름 확인.

## Next Steps
- Jetpack Compose 기반의 프로젝트 스캐폴딩.
- 기초 데이터 모델(Room Entity) 구현.
- 암호화 저장소 및 API 연동 모듈 개발.
